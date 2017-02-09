const net = require('net');

let cubbyhole = "This could be your message.";

const PORT = 1337;

const HELP_MSG = [
  "!HELP: The following commands are supported:",
  "!HELP:",
  "!HELP: PUT <msg> Places a new message in the cubby hole.",
  "!HELP: GET       Takes the message out of the cubby hole and displays it.",
  "!HELP: LOOK      Displays message without taking it out of the cubby hole.",
  "!HELP: DROP      Takes the message out of the cubby hole without displaying it.",
  "!HELP: HELP      Shows this message.",
  "!HELP: QUIT      Terminates the connection.\n"
].join("\n");

const CMDS = {
  put: (socket, msg) => {
    cubbyhole = msg;
    socket.write("!PUT: ok\n");
  },
  get: socket => {
    socket.write(`!GET: ${cubbyhole}\n`);
    cubbyhole = "";
  },
  look: socket => {
    socket.write(`!LOOK: ${cubbyhole}\n`);
  },
  quit: socket => {
    socket.write("!QUIT: goodbye\n");
    socket.destroy();
  },
  help: socket => {
    socket.write(HELP_MSG);
  },
  drop: socket => {
    cubbyhole = "";
    socket.write("!DROP: ok\n");
  }
}

function parseCmds(str) {
  const words = str.trim().split(" ");
  const cmd = words.shift().toLowerCase();
  const msg = words.join(" ");

  return [cmd, msg];
}

function handleMsgs(socket) {
  socket.write("!HELLO: welcome aboard\n");

  socket.on('data', data => {
    const cmds = data.toString().split(/\\n|\\r/);

    for (let i = 0; i < cmds.length; i++) {
      const [cmd, msg] = parseCmds(cmds[i]);

      if (Object.keys(CMDS).indexOf(cmd) === -1) return;

      CMDS[cmd](socket, msg);
    }
  });
}

net.createServer(handleMsgs).listen(PORT);

console.log(`Cubbyhole server running at port ${PORT}`);
