const Module = require( './index');

let test_obj = new Module.vitiaObject('https://services.vitiacare.com', '7261039');
console.log(test_obj.token_bearer);

test_obj.prepare().then((res) => {
    if(res) {
        let test = test_obj.test();
        console.log(test);
    } else {
        console.log('Prepare error');
    }
}, 
() => {
    console.log('Unexpected error');
});