class WebSocketManager:
    def __init__(self):
        self.sockets = {}

    def get(self, id):
        return self.sockets.get(id)

    def set(self, id, ws):
        self.sockets[id] = ws

    def delete(self, id):
        if id in self.sockets:
            del self.sockets[id]
