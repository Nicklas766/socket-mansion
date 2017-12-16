# Socket-Mansion

Socket-Mansion help you easily connect your users to rooms, so you can focus on
coding for the actual room function.

You should see your socket-mansion as a container for all rooms, while the modules
you inject are rooms, you decide the states of the rooms.


## Needed to work
Your room-modules needs to return a `setup(socket)`, so we can add the events of
the module to the socket. You'll also need to return a `off(socket)`, so we can
unsubscribe all events when you leave the room.
