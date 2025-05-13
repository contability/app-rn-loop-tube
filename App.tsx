import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import queryString from 'query-string';
import WebView from 'react-native-webview';

// window와 screen 사이즈를 가지고 올 수 있는데 아래 코드를 web으로 보면 dvw라고 보면 되고
// screen이라면 vw가 되겠다.
const YOUTUBE_WIDTH = Dimensions.get('window').width;
// 16:9 맞춰줌.
const YOUTUBE_HEIGHT = YOUTUBE_WIDTH * (9 / 16);

const styles = StyleSheet.create({
  safearea: {flex: 1, backgroundColor: '#242424'},
  inputContainer: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    fontSize: 15,
    color: '#AEAEB2',
    // iOS와 android의 디자인 동일하게 맞추기 위해 적용
    paddingVertical: 0,
    flex: 1,
    marginRight: 4,
  },
  youtubeContainer: {
    width: YOUTUBE_WIDTH,
    height: YOUTUBE_HEIGHT,
    backgroundColor: '#4A4A4A',
  },
  controller: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 72,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  playButton: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlListContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 72,
    alignItems: 'center',
    flexDirection: 'row',
  },
  urlList: {
    color: '#AEAEB2',
  },
  timeText: {
    color: '#AEAEB2',
    alignSelf: 'flex-end',
    marginTop: 15,
    marginRight: 20,
    fontSize: 13,
  },
});

const formatTime = (second: number) => {
  const minute = Math.floor(second / 60);
  const rematiningSeconds = second % 60;

  const formattedMinute = String(minute).padStart(2, '0');
  const formattedSecond = String(rematiningSeconds).padStart(2, '0');

  return `${formattedMinute}:${formattedSecond}`;
  // 19 -> 00:19
};

const App = () => {
  const [url, setUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  // 유튜브가 플레이중인지 여부
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationInSec, setDurationInSec] = useState(0);
  const [currentTimeInSec, setCurrentTimeInSec] = useState(0);
  const webViewRef = useRef<WebView>(null);

  const onPressOpenLink = useCallback(() => {
    const {
      query: {v: id},
    } = queryString.parseUrl(url);
    if (typeof id === 'string') setYoutubeId(id);
    else Alert.alert('질못된 URL입니다.');
  }, [url]);

  const source = useMemo(() => {
    const html = `
        <!DOCTYPE html>
        <html>
          <!-- MEMO: 뷰포트를 디바이스 크기에 맞춰줘야 화면에 딱 맞게 유튜브 영상 웹뷰 띄울 수 있음. -->
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body style="margin: 0; padding: 0">
            <!-- 1. The <iframe> (and video player) will replace this <div> tag. -->
            <div id="player"></div>

            <script>
              // 2. This code loads the IFrame Player API code asynchronously.
              var tag = document.createElement('script');

              tag.src = 'https://www.youtube.com/iframe_api';
              var firstScriptTag = document.getElementsByTagName('script')[0];
              firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

              // 3. This function creates an <iframe> (and YouTube player)
              //    after the API code downloads.
              var player;
              function onYouTubeIframeAPIReady() {
                player = new YT.Player('player', {
                  height: '${YOUTUBE_HEIGHT}',
                  width: '${YOUTUBE_WIDTH}',
                  videoId: '${youtubeId}',
                  playerVars: {
                    playsinline: 1,
                  },
                  events: {
                    onReady: onPlayerReady,
                    // 재생 상태는 이 onStateChange를 통해 알 수 있음.
                    onStateChange: onPlayerStateChange,
                  },
                });
              }

              // 메시지 전송 프로토콜 함수
              function postMessageToRN (type, data){
                const message = JSON.stringify({type, data});
                // 웹에서 앱으로 데이터 전송
                window.ReactNativeWebView.postMessage(message);
              }

              function onPlayerReady(event) {
                // MEMO: 로드 완료 되면 자동 실행
                // event.target.playVideo();
                postMessageToRN('duration', player.getDuration());
              }

              function onPlayerStateChange(event) {
                // 현재 영상이 재생중인지 아닌지 웹에서 앱으로 데이터 전송
                postMessageToRN('player-state', event.data);
              }
            </script>
          </body>
        </html>
    `;
    return {html};
  }, [youtubeId]);

  const onPressPlay = useCallback(() => {
    if (webViewRef.current != null) {
      // web으로 메시지 보내는 작업
      // 위의 source 식별자로 정의되어 있는 스크립트 내용 보면 유튜브API를 통해 player 인스턴스가 생성되어 있다. 이걸 이용하는 중.
      // 뒤에 true 안넣으면 warning 떠서 넣음.
      webViewRef.current?.injectJavaScript('player.playVideo(); true;');
    }
  }, []);

  const onPressPause = useCallback(() => {
    if (webViewRef.current != null) {
      webViewRef.current?.injectJavaScript('player.pauseVideo(); true;');
    }
  }, []);

  // durationInSec이 소수로 올 수 있기 때문에 Math.floor 적용
  const durationText = useMemo(
    () => formatTime(Math.floor(durationInSec)),
    [durationInSec],
  );

  const currentTimeText = useMemo(
    () => formatTime(Math.floor(currentTimeInSec)),
    [currentTimeInSec],
  );

  useEffect(() => {
    if (isPlaying) {
      const id = setInterval(() => {
        if (webViewRef.current != null) {
          webViewRef.current.injectJavaScript(
            'postMessageToRN("current-time", player.getCurrentTime()); true;',
          );
        }
      }, 50);

      return () => {
        clearInterval(id);
      };
    }
  }, [isPlaying]);

  return (
    <SafeAreaView style={styles.safearea}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="클릭하여 링크를 삽입하세요."
          placeholderTextColor="#AEAEB2"
          style={styles.input}
          onChangeText={setUrl}
          // value를 굳이 넣어주는 이유는 상태 관리와 관련이 있는데 입력 필드의 값이 항상 최신 상태와 동기화 되도록 보장할 수 있다.
          // 특수한 경우에 입력이 오류가 났다고 가정한다면 실제 텍스트 인풋의 value와 url state의 값이 달라질 수 있따.
          value={url}
          // 뭘 입력하는 input인지에 따라 키보드 UI 달라짐.
          inputMode="url"
        />
        {/* hitSlop: 버튼 영역을 넓혀줌. 이거 안주면 정확히 아이콘을 터치했을 때만 버튼이 작동하기 때문에 접근성에 좋지 않음. */}
        <TouchableOpacity
          hitSlop={{top: 10, bottom: 10, right: 10}}
          onPress={onPressOpenLink}>
          <Icon name="link-plus" color="#AEAEB2" size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.youtubeContainer}>
        {youtubeId && (
          <WebView
            ref={webViewRef}
            source={source}
            // 스크롤 막음.
            scrollEnabled={false}
            // 미디어 재생을 인라인에서 가능하도록 만듦. 안해주면 유튜브 영상 전체 화면으로 실행 됨.
            allowsInlineMediaPlayback={true}
            // 미디어 자동 재생에 유저의 액션이 꼭 필요한지 여부. 유튜브 띄웠을 떄 자동으로 재생되게 할 건지를 조절할 수 있다.
            mediaPlaybackRequiresUserAction={false}
            // 웹에서 보낸 메시지 수신
            onMessage={event => {
              // event.nativeEvent.data는 유튜브 플레이어의 재생중인 state 값을 가지고 있다.(문자열)
              // 1 - 재생중. 그 외에는 다른 숫자.
              console.log(event.nativeEvent.data);
              const {type, data} = JSON.parse(event.nativeEvent.data);
              if (type === 'player-state') setIsPlaying(data === 1);
              else if (type === 'duration') setDurationInSec(data);
              else if (type === 'current-time') setCurrentTimeInSec(data);
            }}
          />
        )}
      </View>
      <Text
        style={styles.timeText}>{`${currentTimeText} / ${durationText}`}</Text>
      <View style={styles.controller}>
        {isPlaying ? (
          <TouchableOpacity style={styles.playButton} onPress={onPressPause}>
            <Icon name="pause-circle" size={41.67} color="#E5E5EA" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.playButton} onPress={onPressPlay}>
            <Icon name="play-circle" size={39.58} color="#00DDA8" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.urlListContainer}>
        <TouchableOpacity
          hitSlop={{right: 50, left: 50}}
          onPress={() => setUrl('https://www.youtube.com/watch?v=rlh76p4T6qw')}>
          <Text style={styles.urlList}>
            https://www.youtube.com/watch?v=rlh76p4T6qw
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;
