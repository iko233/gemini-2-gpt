const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=';
const AUTH_KEY_NO_PROVIDE_FAIL_MESSAGE = JSON.stringify({
    "error": {
        "code": null,
        "message": "You didn't provide an API key. You need to provide your API key in an Authorization header using Bearer auth (i.e. Authorization: Bearer YOUR_KEY), or as the password field (with blank username) if you're accessing the API from your browser and are prompted for a username and password. You can obtain an API key from https://platform.openai.com/account/api-keys.",
        "param": null,
        "type": "invalid_request_error"
    }
});

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    let authorization = request.headers.get('Authorization');
    if (authorization == '' || authorization == undefined || authorization == null) {
         return new Response(AUTH_KEY_NO_PROVIDE_FAIL_MESSAGE)
    }
    let token = authorization.replace('Bearer ', '');
    let body = await request.json();
    let geminiTalkList = convertGptTalkList2GeminiTalkList(body.messages);
    let isStream = body.stream;
    console.log("请求列表为:",geminiTalkList)
    const geminiResponse = await requestGemini(token,geminiTalkList );
    console.log("响应内容为:",geminiResponse)
    if(JSON.parse(geminiResponse).candidates[0].finishReason=='OTHER'){
        return new Response(convert2GptResponse(''));
    }
    const geminiText = JSON.parse(geminiResponse).candidates[0].content.parts[0].text;
    
    if (!isStream) {
        return buildResponse(geminiText);
    }
    const { writable, readable } = new TransformStream();

    const enc = new TextEncoder();
    const writer = writable.getWriter();
    await writer.write(enc.encode(`data: {"id": "chatcmpl-9yBOQH3TdLCRmVS82gnABaHQ0jb25","object": "chat.completion.chunk","created": 1702968312,"model": "gpt-3.5-turbo","choices": [{"delta": {"content": "${geminiText}"},"index": 0,"finish_reason": null}]} \n\n`));
    await writer.write(enc.encode(`data: {"id": "chatcmpl-9yBOQH3TdLCRmVS82gnABaHQ0jb25","object": "chat.completion.chunk","created": 1702968312,"model": "gpt-3.5-turbo","choices": [{"delta": {},"index": 0,"finish_reason": "stop"}]} \n\n`));
    await writer.write(enc.encode(`data: [DONE] \n\n`));
    await writer.close()

    // 返回流式数据给客户端
    return new Response(readable, {
        headers: {
            "content-type": "text/event-stream",
            "access-control-allow-credentials": "true",
            "access-control-allow-headers": "Origin,Content-Type,Accept,User-Agent,Cookie,Authorization,X-Auth-Token,X-Requested-With",
            "access-control-allow-methods": "GET,PUT,POST,DELETE,PATCH,HEAD,CONNECT,OPTIONS,TRACE",
            "access-control-allow-origin": "*",
            "access-control-max-age": "3628800",
        }
    });

 
    
}



async function requestGemini(token, talkList) {
    const requestBody = JSON.stringify({"contents": talkList});
    console.log("开始请求gemini:" + geminiUrl + token+requestBody);
    const response = await fetch(geminiUrl + token, {
        body: requestBody,
        method: "POST",
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    });
    return response.text();
}



function convert2GptResponse(msg) {
    return JSON.stringify({
      "choices": [
          {
              "finish_reason": "stop",
              "index": 0,
              "message": {
                  "content": msg,
                  "role": "assistant"
              }
          }
      ],
      "created": 1702814742,
      "id": "chatcmpl-1Qq8McZaJvX4WrWqJgUHc7gOageEG",
      "model": "",
      "object": "chat.completion",
      "usage": {
          "completion_tokens": 42,
          "prompt_tokens": 0,
          "total_tokens": 42
      }
  })
    
}


function convertGptTalkList2GeminiTalkList(gptTalklist) {
    console.log("gqt对话列表为："+gptTalklist.length);
    let geminiTalkList = [];
    for (let i = 0; i < gptTalklist.length; i++) {
        let gptTalk = gptTalklist[i];
        let geminiTalk = {"role": gptTalk.role=="system"?"model":"user",
        "parts": [
            {
                "text": gptTalk.content
            }
        ]}
        geminiTalkList.push(geminiTalk);
    }
    console.log(geminiTalkList);
    return geminiTalkList;
}



function buildResponse(msg){
    return new Response(convert2GptResponse(msg), {
        headers: {
            "content-type": "application/json",
            "access-control-allow-credentials": "true",
            "access-control-allow-headers": "Origin,Content-Type,Accept,User-Agent,Cookie,Authorization,X-Auth-Token,X-Requested-With",
            "access-control-allow-methods": "GET,PUT,POST,DELETE,PATCH,HEAD,CONNECT,OPTIONS,TRACE",
            "access-control-allow-origin": "*",
            "access-control-max-age": "3628800",
        }
    })
}
