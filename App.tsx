import {useCallback, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import queryString from 'query-string';

const styles = StyleSheet.create({
  safearea: {flex: 1, backgroundColor: '#242424'},
  inputContainer: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
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
    </SafeAreaView>
  );
};

export default App;
