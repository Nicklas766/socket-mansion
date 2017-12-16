var React = require('react');
import io from 'socket.io-client';

import Chat from './Chat.js';

class Home extends React.Component {
    constructor(props) {
       super(props);
       this.state = {
         socket: io(),
         login: true, // Lets assume you've logged in
         user: {name:"nicklas"},
         room: "room1",
         inRoom: false
     };
      this.joinRoom = this.joinRoom.bind(this);
      this.createRoom = this.createRoom.bind(this);
      this.leaveRoom = this.leaveRoom.bind(this);
      this.handleChange = this.handleChange.bind(this);
 }

 componentDidMount() {
   const {socket, user} = this.state;

    socket.on('get rooms', (rooms) => {
        this.setState({rooms: rooms});
    });

    socket.emit('setup user', user);
    console.log(user);
}

  componentWillUnmount() {
      this.state.socket.close();
  }

  handleChange(event) {
      this.setState({room: event.target.value});
      console.log(this.state.room);
  }

  createRoom() {
    this.state.socket.emit('create room', this.state.room, 'chat');
  }

  joinRoom() {
    this.state.socket.emit('join room', this.state.room);
    this.setState({inRoom: true});
  }
  leaveRoom() {
    this.state.socket.emit('leave room', this.state.room);
    this.setState({inRoom: false});
  }

  render() {
    return (
        <div>
            <h1>Socket-Mansion</h1>
            <p> Select something to create or join </p>
             <select value={this.state.room} onChange={this.handleChange}>
              <option value="room1">room1</option>
              <option value="room2">room2</option>
              <option value="room3">room3</option>
            </select>

             <button onClick={this.createRoom}>Create</button>
             <button onClick={this.joinRoom}>Join</button>
             <button onClick={this.leaveRoom}>Leave</button>

            {this.state.inRoom && <Chat socket={this.state.socket} id={this.state.room} />}
        </div>
    );
  }
}

module.exports = Home;
