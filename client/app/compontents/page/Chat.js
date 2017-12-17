var React = require('react');


class Chat extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          socket: this.props.socket,
          id: this.props.id,
          messages: [],
          text: ''
      };
      this.handleInputChange = this.handleInputChange.bind(this);
      this.sendMessage       = this.sendMessage.bind(this);
    }

    componentDidMount() {
        const {socket, id, messages} = this.state;

        // Events
        socket.on(`message ${id}`, (messages) => {
            console.log(messages);
            this.setState({messages: messages});
        });
    }

    sendMessage() {
        const {socket, id, text} = this.state;
        socket.emit(`message ${id}`, text);
        this.setState({text: ''});
    }

    handleInputChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        const {text, id, users, messages} = this.state;

        const msgs = messages.map(msg => <div>{msg.name}: {msg.text}</div>);

        return (
            <div>
                <h1>Room {id}</h1>
                {msgs}
                    <textarea
                        name={"text"}
                        value={text}
                        onChange={this.handleInputChange}
                        placeholder={"Type your message here"}
                        style={{width:"100%"}}
                    />
                    <button onClick={this.sendMessage}>Send message</button>
            </div>
        );
    }
}

module.exports = Chat;
