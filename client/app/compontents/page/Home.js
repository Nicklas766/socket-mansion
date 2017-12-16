var React = require('react');
import io from 'socket.io-client';

class Home extends React.Component {
    constructor(props) {
       super(props);
       this.state = {
         socket: io(),
         login: true, // Lets assume you've logged in
         user: {name:"nicklas"},
         rooms: []
     };
      this.joinRoom = this.joinRoom.bind(this);
      this.createRoom = this.createRoom.bind(this);
      this.leaveRoom = this.leaveRoom.bind(this);
      this.pingRoom = this.pingRoom.bind(this);

      this.joinRoom2 = this.joinRoom2.bind(this);
      this.createRoom2 = this.createRoom2.bind(this);
 }

 componentDidMount() {
    this.state.socket.on('get rooms', (rooms) => {
        this.setState({rooms: rooms});
    });
    this.state.socket.emit('setup user', this.state.user);
}

componentWillUnmount() {
    this.state.socket.close();
}

createRoom() {
  this.state.socket.emit('create room', 'room1', 'chat');
}
createRoom2() {
  this.state.socket.emit('create room', 'room2', 'chat');
}
joinRoom() {
  this.state.socket.emit('join room', 'room1');
}
joinRoom2() {
  this.state.socket.emit('join room', 'room2');
}
leaveRoom() {
  this.state.socket.emit('leave room', 'room1');
}
pingRoom() {
  this.state.socket.emit('ping room1');
}
  render() {
    return (
        <div>
            <h1>Socket-Mansion</h1>
             <button onClick={this.createRoom}>Create room</button>
             <button onClick={this.joinRoom}>Join Room</button>
             <button onClick={this.pingRoom}>Ping Room</button>

             <button onClick={this.createRoom2}>Create room2</button>
             <button onClick={this.joinRoom2}>Join Room2</button>
        </div>
    );
  }
}

module.exports = Home;
