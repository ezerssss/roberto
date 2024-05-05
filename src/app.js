'use strict';

import getCurrentTime from './clock';
import getDay from './day';
import './app.css';
import { chatToAI } from './ai';
import './moodle';

(function () {
  function setTime() {
    const time = getCurrentTime();

    document.getElementById('clock').innerHTML = time;
  }

  function setDay() {
    const day = getDay();

    document.getElementById('day').innerHTML = day;
  }

  function setupDashboard() {
    setDay();
    setTime();
    setInterval(setTime, 1000);
  }

  setupDashboard();
})();

const moodleToken = localStorage.getItem('moodleToken');
const moodleUserID = localStorage.getItem('moodleUserID');
const apiKey = localStorage.getItem('apiKey');
const firstName = localStorage.getItem('firstName');

const moodleRegisterContainer = document.getElementById('moodle-register');
const moodleForm = document.getElementById('moodle-form');
const moodleSpinner = document.getElementById('moodle-spinner');

const mainContentContainer = document.getElementById('main');

const errorText = document.getElementById('error');

if (moodleToken && moodleUserID && firstName && apiKey) {
  mainContentContainer.style.display = 'block';
  chatToAI('Hi.');
} else {
  moodleRegisterContainer.style.display = 'block';
  moodleForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = moodleForm.username.value;
    const password = moodleForm.password.value;

    moodleForm.submit.style.display = 'none';
    moodleSpinner.style.display = 'block';

    const res = await fetch(
      'https://upvisayas.net/lms3/login/token.php?service=moodle_mobile_app',
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&password=${password}`,
      }
    );

    const data = await res.json();
    console.log(data);

    if (data.error) {
      errorText.style.display = 'block';
      errorText.innerText = data.error;
    } else {
      localStorage.setItem('moodleToken', data.token);

      console.log(data.token);

      const userRes = await fetch(
        'https://upvisayas.net/lms3/webservice/rest/server.php?moodlewsrestformat=json',
        {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `wstoken=${data.token}&wsfunction=core_webservice_get_site_info`,
        }
      );

      const user = await userRes.json();

      console.log(user);

      if (user.errorcode) {
        errorText.style.display = 'block';
        errorText.innerText = user.message;
      } else {
        localStorage.setItem('moodleUserID', user.userid);
        localStorage.setItem('firstName', user.firstname);
        localStorage.setItem('apiKey', moodleForm.apiKey.value);

        moodleRegisterContainer.style.display = 'none';
        mainContentContainer.style.display = 'block';

        window.location.reload();
      }
    }

    moodleSpinner.style.display = 'none';
    moodleForm.submit.style.display = 'block';
  });
}

const aiRespond = document.getElementById('respond');
aiRespond.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    aiRespond.classList.add('remove-input');
    aiRespond.classList.add('hidden');
    aiRespond.classList.remove('show-input');
    chatToAI(aiRespond.value);
    aiRespond.value = '';
  }
});
