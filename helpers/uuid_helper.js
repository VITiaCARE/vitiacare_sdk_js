
import 'react-native-get-random-values';
export function get_uuid(){
    const { v4: uuidv4 } = require('uuid');
    let id = uuidv4();
    return id
}