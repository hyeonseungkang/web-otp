document.querySelector('.fingerprint').style =
  `font-size:${document.querySelector('h1').clientHeight}px`;

const colors = [
  'red',
  'deep-purple',
  'indigo',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'orange',
  'brown',
];

const random = () => {
  return String(crypto.getRandomValues(new Uint32Array(1))[0]);
};

const socket = io();

socket.on('message', (stream) => {
  console.log(stream);
  const logs = document.querySelector(`#${stream.id}.logs`);
  if (logs.value.length < 1) {
    logs.value = stream.body;
  } else {
    logs.value = logs.value + '\n' + stream.body;
  }
});

socket.on('auth', (stream) => {
  if (!stream) {
    alert('Session expired. Reload required.');
    window.location.reload();
  }
});

socket.on('image', (stream) => {
  alert(!stream ? 'Bad QR Image file.' : 'QR Image parsed.');
  window.location.reload();
});

let timeout = null;

socket.on('sync', (stream) => {
  document.querySelector('progress').value = (stream / 60000) * 100;
  if (!timeout) {
    setTimeout(() => window.location.reload(), 60000 - stream);
  }
});

socket.on('digits', (stream) => {
  stream.forEach((digit) => {
    const example = document.querySelector('#digit-example').cloneNode(true);
    example.style = '';
    example.querySelector('.title').innerText = digit.name;
    example.querySelector('.issuer').innerText = digit.issuer;
    if (!!digit.issuer && digit.issuer !== '') {
      example.querySelector('i').className =
        example.querySelector('i').className +
        ' ' +
        colors[Number(String(digit.issuer.slice(0, 1).charCodeAt()).slice(-1))];
    }
    example.querySelector('.digit').innerText = digit.digit;
    example.addEventListener('click', () => {
      try {
        navigator.clipboard.writeText(digit.digit);
        example.style = 'background-color:grey;';
        setInterval(() => {
          example.style = '';
        }, 300);
      } catch {
        alert('Cannot access to clipboard. Copy canceled.');
      }
    });
    document.querySelector('.collection').append(example);
  });
});

const inputFileOnChange = (target) => {
  const file = target.files[0];
  if (!file.type || !file.type.includes('image/')) {
    alert('No image type.');
    target.value = '';
  } else {
    target.disabled = 1;
    document.querySelector('.processing').style = '';
    file.arrayBuffer().then((r) => socket.emit('image', target.id, r));
  }
};

document
  .querySelector('#input-image')
  .addEventListener('change', ({ target }) => inputFileOnChange(target));

socket.emit('digits', true);
setInterval(() => {
  socket.emit('sync', true);
}, 1000);
