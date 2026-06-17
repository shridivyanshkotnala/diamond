

async function test() {
  const authkey = '532419TMjzbQpYK6a30f92fP1'; // from .env
  const templateId = '6a30fbb716c27f1c710da2f2'; // from .env
  const phone = '9999999999'; // dummy
  const otp = '123456';

  const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${phone}&authkey=${authkey}&otp=${otp}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    console.log("Query params approach:", data);
  } catch (err) {
    console.error("Error 1:", err);
  }

  try {
    const response2 = await fetch('https://control.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authkey: authkey,
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: `91${phone}`,
        otp,
      }),
    });

    const data2 = await response2.json();
    console.log("Body approach:", data2);
  } catch (err) {
    console.error("Error 2:", err);
  }
}

test();
