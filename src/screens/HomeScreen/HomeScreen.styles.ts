import {StyleSheet} from 'react-native';
import {getShadowProps} from '../../helpers';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: 'white',
  },
  itemContainer: {
    width: '100%',
    height: 70,
    backgroundColor: 'white',
    marginTop: 30,
    justifyContent: 'center',
    ...getShadowProps(),
    paddingLeft: 20,
  },
  itemText: {
    fontSize: 17,
    color: 'black',
  },
  qrResultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional: background for better visibility
    borderRadius: 5,
  },
  qrResultText: {
    fontSize: 16,
    marginVertical: 5, // Adds padding between QR codes
  },
});
