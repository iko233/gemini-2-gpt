# gemini-2-gpt
cloudfalre gemini api 转换成gpt的api

gemini api covert to openai chatgpt api for cloudflare-worker

# 1.api密钥申请
打开[google ai studio官网](https://makersuite.google.com) 如图所示，保存这一段密钥
<img width="1512" alt="image" src="https://github.com/iko233/gemini-2-gpt/assets/44130042/222dd165-d1be-4678-8188-abb5a9433895">
<img width="705" alt="image" src="https://github.com/iko233/gemini-2-gpt/assets/44130042/6a1ed4f1-e290-4df8-9107-6068ee2835d7">

# 2.创建cloudfalre woker 应用
登陆[cloudfalre](https://dash.cloudflare.com)后，如图所示，选择左侧Account Workers & Pages Page 然后点击中间的Create application
<img width="1512" alt="image" src="https://github.com/iko233/gemini-2-gpt/assets/44130042/c44c93b8-3f77-4a90-b237-f70b6d139d97">
选择Create Worker
<img width="1512" alt="image" src="https://github.com/iko233/gemini-2-gpt/assets/44130042/cd704a8c-2bf7-4d1c-b727-42107b973e95">
点击deploy
<img width="1073" alt="image" src="https://github.com/iko233/gemini-2-gpt/assets/44130042/07bcbd4d-aaa1-4bc3-b456-f6a35a152d05">
保存这一段网址,这是接下来请求api的网址,然后点击Edit code
<img width="520" alt="image" src="https://github.com/iko233/gemini-2-gpt/assets/44130042/cdcfb99e-8258-4e2c-98eb-bcb4092eab0c">
将这个[网址](https://raw.githubusercontent.com/iko233/gemini-2-gpt/main/cloudflare-woker.js)内的内容粘贴到图中1的区域 点击右侧Save and deploy
<img width="1512" alt="image" src="https://github.com/iko233/gemini-2-gpt/assets/44130042/e84bbafc-7b2e-4150-86ac-d84765faaf85">
接下来就是把key和请求的地址配置到你想要使用的应用即可
