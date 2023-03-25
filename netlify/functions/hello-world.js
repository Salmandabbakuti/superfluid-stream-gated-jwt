const dayjs = require('dayjs');

export const handler = async () => {
  const date = dayjs().format('YYYY-MM-DD HH:mm:ss');
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello World! The time is ${date}`
    })
  };
};