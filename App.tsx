// https://www.youtube.com/watch?v=rlh76p4T6qw

import {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
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
});

const App = () => {
  const [url, setUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const onPressOpenLink = useCallback(() => {
    const {
      query: {v: id},
    } = queryString.parseUrl(url);
    console.log('🚀 ~ onPressOpenLink ~ id:', id);
    if (typeof id === 'string') setYoutubeId(id);
    else Alert.alert('질못된 URL입니다.');
  }, [url]);

  const source = useMemo(() => {
    const html = `
        <!DOCTYPE html>
  <html>
  <!-- MEMO: 뷰포트를 디바이스 크기에 맞춰줘야 화면에 딱 맞게 유튜브 영상 웹뷰 띄울 수 있음. -->
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
    <body style="margin: 0; padding: 0;">
      <!-- 1. The <iframe> (and video player) will replace this <div> tag. -->
      <div id="player"></div>

      <script>
        // 2. This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
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
              'playsinline': 1
            },
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
        }

        // 4. The API will call this function when the video player is ready.
        function onPlayerReady(event) {
          event.target.playVideo();
        }

        // 5. The API calls this function when the player's state changes.
        //    The function indicates that when playing a video (state=1),
        //    the player should play for six seconds and then stop.
        var done = false;
        function onPlayerStateChange(event) {
          if (event.data == YT.PlayerState.PLAYING && !done) {
            setTimeout(stopVideo, 6000);
            done = true;
          }
        }
        function stopVideo() {
          player.stopVideo();
        }
      </script>
    </body>
  </html>
    `;
    return {html};
  }, [youtubeId]);
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
            source={source}
            // 스크롤 막음.
            scrollEnabled={false}
            // 미디어 재생을 인라인에서 가능하도록 만듦. 안해주면 유튜브 영상 전체 화면으로 실행 됨.
            allowsInlineMediaPlayback={true}
            // 미디어 자동 재생에 유저의 액션이 꼭 필요한지 여부. 유튜브 띄웠을 떄 자동으로 재생되게 할 건지를 조절할 수 있다.
            mediaPlaybackRequiresUserAction={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default App;
