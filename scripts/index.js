const header = document.querySelector('header');
const tasksForm = document.forms.tasks; //document.querySelector('form[name=tasks]');
const taskFormElems = tasksForm.elements;
const tasksTextArea = document.querySelector('#tasksList');
const completedArea = document.querySelector('.output');
const userName = document.querySelector('#username');
const submitForm = document.querySelector('input[type=submit]');
const codewarsKatasApi = `https://www.codewars.com/api/v1/users/{user}/code-challenges/completed?`
const codewarsUsersApi = 'https://www.codewars.com/api/v1/users/{user}'
const codewarsChallengesApi = 'https://www.codewars.com/api/v1/code-challenges/{challenge}'
tasksTextArea.value = localStorage.text || '';
completedArea.innerHTML = localStorage.output || '';
userName.value = localStorage.username || '';

tasksTextArea.addEventListener('change', () => {
  addToLocalStorage('text', tasksTextArea.value)
})
tasksTextArea.addEventListener('keyup', () => {
  addToLocalStorage('text', tasksTextArea.value)
})

submitForm.addEventListener('click', (ev) => {
  ev.preventDefault();
  //runCheck();
  runCheckThrowApi();
})


function runCheckThrowApi() {
  if (!userName.value || !tasksTextArea.value) {
    alert('Fill Username and Task fields!');
    return false;
  }

  document.querySelector('.total').textContent = ''
  completedArea.innerHTML = `<img src="loader.png" class="loader">`
  let initDegree = 0;
  const loader = document.querySelector('.loader');
  const loaderInt = setInterval(() => {
    const deg = initDegree;
    loader.style.transform = `rotate(${deg}deg)`
    if (initDegree > Number.MIN_SAFE_INTEGER - 20) {
      initDegree -= 20
    } else initDegree = 0;
  }, 100)

  fetch(codewarsKatasApi.replace('{user}', userName.value))
    .then(res => res.json())
    .then(r => {
      console.log(r);
      completedArea.innerHTML = '';
      clearInterval(loaderInt);
      if (r.totalItems >= 0) {
        const completedKatas = r.data.flat().filter(o => o.completedLanguages.findIndex(lang => lang === "javascript") > -1);
        const slugs = [...completedKatas.map(o => o.slug)];
        const ids = [...completedKatas.map(o => o.id)];
        const katas = {
          slugs,
          ids
        }

        const checked = checkKata(tasksTextArea.value, katas);
        console.log(checked);
        for (let i = 0; i < checked.tasksName.length; i++) {

          const txt = `${i + 1}. ${checked.tasksName[i]}`;

          const h4 = document.createElement('h4');
          const a = document.createElement('a');
          const pseudoAfter = document.createElement('p');

          pseudoAfter.textContent = checked.checkedTasks[checked.tasksName[i]] ? 'Done!' : 'Not completed.';
          h4.textContent = txt;
          a.href = checked.tasksLinks[i];
          a.setAttribute('target', '_blank')
          checked.checkedTasks[checked.tasksName[i]] ? pseudoAfter.style.color = 'green' : pseudoAfter.style.color = 'red';


          a.appendChild(h4);
          a.appendChild(pseudoAfter);
          completedArea.appendChild(a);
          localStorage.setItem('output', `${completedArea.innerHTML}`)
          localStorage.setItem('username', `${userName.value}`)

          fetch(codewarsChallengesApi.replace('{challenge}', checked.tasksName[i]))
            .then(res => res.json())
            .then(ch => {
              console.log(ch);
              const name = ch.name ? ch.name : checked.tasksName[i];
              const txt = `${i + 1}. ${name}`;
              h4.textContent = txt;
            })
        }
        document.querySelector('.total-kata').textContent = numberWithSep(r.totalItems, ' ');
        document.querySelector('.total-kata').classList.remove('hidden');

        fetch(codewarsUsersApi.replace('{user}', userName.value))
          .then(res => res.json())
          .then(u => {
            console.log(u);
            document.querySelector('h1').classList.add('hidden');

            //document.querySelector('.user-image').src = u.avatar;
            document.querySelector('.name').textContent = u.name;
            document.querySelector('.user-name').textContent = `@${u.username}`;

            document.querySelector('.rank').textContent = u.ranks.overall.name;
            document.querySelector('.rank').classList.remove('hidden');
            document.querySelector('.honor').textContent = numberWithSep(u.honor, ' ');
            document.querySelector('.honor').classList.remove('hidden');
            document.querySelector('.leader-position').textContent = `№ ${numberWithSep(u.leaderboardPosition, ' ')}`;
            document.querySelector('.leader-position').classList.remove('hidden');


            document.querySelector('.total').textContent = `${checked.completed} / ${checked.required}`;
          })

      }
    })

  return true;

}

function runCheck() {
  if (!userName.value || !tasksTextArea.value) {
    alert('Fill Username and Task fields!')
  } else {

    document.querySelector('.total').textContent = ''
    completedArea.innerHTML = `<img src="loader.png" class="loader">`
    let initDegree = 0;
    const loader = document.querySelector('.loader');
    const loaderInt = setInterval(() => {
      const deg = initDegree;
      loader.style.transform = `rotate(${deg}deg)`
      if (initDegree > Number.MIN_SAFE_INTEGER - 20) {
        initDegree -= 20
      } else initDegree = 0;
    }, 100)



    // fetch('http://127.0.0.1/check', {
    fetch('https://codewars-check.herokuapp.com/check', {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: userName.value })
    })
      .then(res => res.json())
      .then(r => {

        if (r.success) {
          const completedKatas = r.completed.flat();
          const slugs = [...completedKatas.map(o => o.slug)];
          const ids = [...completedKatas.map(o => o.id)];
          const katas = {
            slugs,
            ids
          }

          const checked = checkKata(tasksTextArea.value, katas);

          if (checked.tasksName.length > 0) {
            /* Output here */

            // fetch('http://127.0.0.1/kata', {
            fetch('https://codewars-check.herokuapp.com/kata', {
              method: 'post',
              headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ slug_or_id: checked.tasksName })
            })
              .then(res => res.json())
              .then(r => {
                completedArea.innerHTML = '';
                clearInterval(loaderInt);

                for (let i = 0; i < checked.tasksName.length; i++) {
                  const txt = `${i + 1}. ${r[checked.tasksName[i]]}`;
                  const h4 = document.createElement('h4');
                  const a = document.createElement('a');
                  const pseudoAfter = document.createElement('p');

                  pseudoAfter.textContent = checked.checkedTasks[checked.tasksName[i]] ? 'Done!' : 'Not completed.';
                  h4.textContent = txt;
                  a.href = checked.tasksLinks[i];
                  a.setAttribute('target', '_blank')
                  checked.checkedTasks[checked.tasksName[i]] ? pseudoAfter.style.color = 'green' : pseudoAfter.style.color = 'red';


                  a.appendChild(h4);
                  a.appendChild(pseudoAfter);
                  completedArea.appendChild(a);
                  localStorage.setItem('output', `${completedArea.innerHTML}`)
                  localStorage.setItem('username', `${userName.value}`)
                }
              })

          } else {
            completedArea.innerHTML = '<h3 style="text-align: center">Tasks not found<h3>'
          }

          document.querySelector('h1').classList.add('hidden');

          document.querySelector('.user-image').src = r.avatar;
          document.querySelector('.name').textContent = r.name;
          document.querySelector('.user-name').textContent = `@${r.username}`;

          document.querySelector('.rank').textContent = r.ranks.overall.name;
          document.querySelector('.rank').classList.remove('hidden');
          document.querySelector('.honor').textContent = numberWithSep(r.honor, ' ');
          document.querySelector('.honor').classList.remove('hidden');
          document.querySelector('.leader-position').textContent = `№ ${numberWithSep(r.leaderboardPosition, ' ')}`;
          document.querySelector('.leader-position').classList.remove('hidden');
          document.querySelector('.total-kata').textContent = numberWithSep(r.items, ' ');
          document.querySelector('.total-kata').classList.remove('hidden');

          document.querySelector('.total').textContent = `${checked.completed} / ${checked.required}`;

          return true;

        } else {
          clearInterval(loaderInt);
          document.querySelector('.name').textContent = 'Not found! Check "Username" field';
          completedArea.innerHTML = '';
          userName.focus();
        }

      });
  }
}

function checkKata(requiredTasks, katas) {
  const completedSlugs = [...katas.slugs];
  const completedIDs = [...katas.ids];


  const reLink = /((http(s)?:\/\/)?(www\.)?)?codewars\.com\/kata\/[\/a-z0-9._&?%$-]*/i
  const reTask = /((http(s)?:\/\/)?(www\.)?)?codewars\.com\/kata\/([a-z0-9._&?%$-]*)+/i

  const tasksRequiered = [...requiredTasks
    .split('\n')
    .map(row => row.trim())
    .filter(row => reLink.test(row))
    .map(row => row.match(reTask)[5])
  ];


  const result = tasksRequiered.reduce((acc, cur) => {
    acc[cur] = (completedSlugs.includes(cur) || completedIDs.includes(cur));
    return acc;
  }, {});

  const countTasks = tasksRequiered.length;
  const completedTasksCount = Object.values(result).filter(done => done === true).length;
  const tasksHrefs = [];

  tasksRequiered.forEach(el => tasksHrefs.push(`http://www.codewars.com/kata/${el}`))

  const output = {
    required: tasksRequiered.length,
    completed: completedTasksCount,
    tasksName: tasksRequiered,
    checkedTasks: result,
    tasksLinks: tasksHrefs
  };

  return output;
}

function numberWithSep(x, sep) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep.toString());
}

function addToLocalStorage(key, value) {
  localStorage.setItem(key, value)
}
