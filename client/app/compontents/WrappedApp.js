var React = require('react');
var NavLink = require('react-router-dom').NavLink;



const Header = (props) => (
    <div className="header">
        <div>
            <NavLink exact activeClassName='active' to='/'>
                Home
            </NavLink>
        </div>
    </div>
);




class WrappedApp extends React.Component {
    render() {
        return (
            <div className={"container"}>
                <Header />
                <div>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

module.exports = WrappedApp;
