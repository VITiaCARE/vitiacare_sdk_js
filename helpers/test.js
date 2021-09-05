const Module = require( '../index');

let test_obj = new Module.vitiaObject('https://services.vitiacare.com', '7261039', obj_type="", user_token="", user_id="", search_params="", file_type="");

let test = test_obj.test();

console.log(test);