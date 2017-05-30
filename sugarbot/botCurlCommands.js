curl -X POST -H "Content-Type: application/json" -d '{ 
  "get_started":{
    "payload":"GET STARTED"
  }
}' "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=EAAJhTtF5K30BAJaPLaqAsQe38FK2nToDDxB4PF7ddr28iHlgLEUWGd0JZCLOQxeJrSqED8o0DwE7U5zBrDblSGM2dha9k3STKk3iVOkfSBW2L5eeDe0ylyiCp1Vq50Ac4ZBdouD3p5rGtfVnjVh4YLtOsQDIgS7T1W10PCZBQZDZD" 

curl -X POST -H "Content-Type: application/json" -d '{
  "persistent_menu":[
    {
      "locale":"default",
      "composer_input_disabled":true,
      "call_to_actions":[
        {
          "title":"Sugarbot Options",
          "type":"nested",
          "call_to_actions":[
            {
              "title":"Send Nutrition Label",
              "type":"postback",
              "payload":"send nutrition label"
            },
            {
              "title":"Random Sugar Facts",
              "type":"postback",
              "payload":"random sugar facts"
            },
            {
              "title":"Not Sugar?",
              "type":"postback",
              "payload":"not sugar?"
            }
          ]
        },
        {
          "type":"web_url",
          "title":"Home Page",
          "url":"http://inphood.com",
          "webview_height_ratio":"full"
        }
      ]
    }
  ]
}' "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=EAAJhTtF5K30BAJaPLaqAsQe38FK2nToDDxB4PF7ddr28iHlgLEUWGd0JZCLOQxeJrSqED8o0DwE7U5zBrDblSGM2dha9k3STKk3iVOkfSBW2L5eeDe0ylyiCp1Vq50Ac4ZBdouD3p5rGtfVnjVh4YLtOsQDIgS7T1W10PCZBQZDZD"
