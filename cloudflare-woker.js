const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key='
const AUTH_KEY_NO_PROVIDE_FAIL_MESSAGE = `{
  "error": {
      "code": null,
      "message": "You didn't provide an API key. You need to provide your API key in an Authorization header using Bearer auth (i.e. Authorization: Bearer YOUR_KEY), or as the password field (with blank username) if you're accessing the API from your browser and are prompted for a username and password. You can obtain an API key from https://platform.openai.com/account/api-keys.",
      "param": null,
      "type": "invalid_request_error"
  }
}`

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
    let message = body.messages[0].content;
    let isStream = body.stream;

    const response = await requestGemini(token, message);

    if (isStream) {
        const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(`data: [DONE] \n\n`);
              controller.enqueue(`data: {
                  "id": "chatcmpl-9yBOQH3TdLCRmVS82gnABaHQ0jb25",
                  "object": "chat.completion.chunk",
                  "created": 1702820230,
                  "model": "gpt-3.5-turbo",
                  "choices": [
                      {
                          "delta": {},
                          "index": 0,
                          "finish_reason": "stop"
                      }
                  ]
                  }\n\n`);
              controller.enqueue("data: " + convert2GptResponse(isStream, getGeminiText(response)) + `\n\n`);
              controller.close(); 
            }
        });
        // 设置适当的响应头
        const headers = new Headers();
        headers.set('Content-Type', 'text/event-stream'); // 设置为text/event-stream

        // 返回流式数据给客户端
        return new Response(stream, {
            status: 200,
            statusText: 'OK',
            headers,
        });
    } else {
        return new Response(convert2GptResponse(isStream, getGeminiText(response)), {
            headers: {
                "content-type": "application/json",
                "access-control-allow-credentials": "true",
                "access-control-allow-headers": "Origin,Content-Type,Accept,User-Agent,Cookie,Authorization,X-Auth-Token,X-Requested-With",
                "access-control-allow-methods": "GET,PUT,POST,DELETE,PATCH,HEAD,CONNECT,OPTIONS,TRACE",
                "access-control-allow-origin": "*",
                "access-control-max-age": "3628800",
            }
        }
        );
    }

}



async function requestGemini(token, message) {
    console.log("开始请求gemini:" + geminiUrl + token);
    const response = await fetch(geminiUrl + token, {
        body: '{"contents": [{"parts": [{"text": "#{message}"}]}]}'.replace('#{message}', message),
        method: "POST",
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    });
    return response.text();
}

function getGeminiText(response) {
    return JSON.parse(response).candidates[0].content.parts[0].text;
}

function convert2GptResponse(isStream, msg) {
    if (isStream) {
        return `{
      {
        "id": "chatcmpl-9yBOQH3TdLCRmVS82gnABaHQ0jb25",
        "object": "chat.completion.chunk",
        "created": 1702820230,
        "model": "gpt-3.5-turbo",
        "choices": [
            {
                "delta": {
                  "content": "#{response}"
                },
                "index": 0,
                "finish_reason": "stop"
            }
        ]
    }
  }`.replace('#{response}', msg);
    } else {
        return `{
      "choices": [
          {
              "finish_reason": "stop",
              "index": 0,
              "message": {
                  "content": "#{response}",
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
  }`.replace('#{response}', msg);
    }
}
