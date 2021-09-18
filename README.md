![alt text](logo_h.png)

**This library allows you to quickly and easily use the VITiaCare API v1 via NodeJS.**


# Table of Contents

* [Installation](#installation)
* [Quick Start](#quick-start)
<!-- * [Usage](#usage)
* [Use Cases](#use-cases)
* [Announcements](#announcements)
* [How to Contribute](#contribute)
* [Troubleshooting](#troubleshooting)
* [About](#about)
* [License](#license) -->



<a name="installation"></a>

# Installation

## Prerequisites

- VITiaCare API Key (contact development@vitiacare.com for more info)


## Dependencies

- [NodeJS](https://nodejs.org/en/) - last tested on v14

## Install Package
```bash
npm install @vitiacare/vitiacare_sdk_js
```

<a name="quick-start"></a>
# Quick Start

## Test EP

The following is the minimum needed code initiate a Vitia Object and call the testing endpoint:


```
const Module = require( '../index');

let test_obj = new Module.vitiaObject('https://services.vitiacare.com', <YOUR-API-KEY>, obj_type="", user_token="", user_id="", search_params="", file_type="");

test_obj.prepare().then(async (res) => {
  if(res) {
      let test = await test_obj.test();
      console.log(test.res);
  } else {
      console.log('Prepare error');
  }
}, 
() => {
  console.log('Unexpected error');
});
```
