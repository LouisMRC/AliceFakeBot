const prompts = require('prompts');
 
(async () => {
  const response = await prompts({
        type: "text",
        name: "token",
        message: "Bot Token: "
  });
 
  console.log(response); // => { value: 24 }
})();
