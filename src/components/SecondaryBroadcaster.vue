<template>
    <div>
        <v-container>
        <v-card
            max-width="640"
            class="mx-auto">
            <v-list-item>
            <v-list-item-avatar color="grey"></v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="headline">Secondary Broadcaster</v-list-item-title>
                <v-list-item-subtitle>by Robby</v-list-item-subtitle>
            </v-list-item-content>
            </v-list-item>
            <v-container>
                <video ref="video" id="vid" playsinline autoplay muted poster="../assets/poster.png">

                </video>
            </v-container>
            <v-card-text>
                This video will broadcast to any dedicated streamer.
            </v-card-text>

            <v-card-actions>
                <v-btn-toggle v-model="toggle_multiple"
                    dense
                    multiple>
                    <v-btn v-on:click="play()" >
                        <v-icon>mdi-power</v-icon>
                    </v-btn>
                </v-btn-toggle>
            <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-container>
    <v-snackbar v-model="errorView" >
        {{ errorText }}
        <v-btn
            color="pink"
            text
            @click="errorView = false">
            Close
      </v-btn>
    </v-snackbar>
    <v-snackbar v-model="messageView" :timeout="timeout">
        {{ message }}
    </v-snackbar>
    </div>
</template>
<script>
import io from 'socket.io-client';
const config = {
	'iceServers': [{
        'urls': ['stun:stun.l.google.com:19302']
    }],
    'iceTransports': 'relay'
}
/** @type {MediaStreamConstraints} */
const constraints = {
	video: {facingMode: "user"}
};
export default {
    name: 'SecondaryBroadcaster',
    data: () => ({
        toggle_multiple: [],
        video: {},
        peerConnections: {},
        socket: {},
        isOnline: false,
        errorView: false,
        errorText: '',
        messageView: false,
        message: '',
        timeout: 2000,
    }),
    methods: {
        socketInit() {
            const self = this;
            self.socket.on('answer', (id, description) => {
                self.peerConnections[id].setRemoteDescription(description);
            })
            self.socket.on('watcher', (id) => {
                const peerConnection = new RTCPeerConnection(config);
                self.peerConnections[id] = peerConnection;
                let stream = self.video.srcObject;
                stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
                peerConnection.createOffer()
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    self.socket.emit('offer', id, peerConnection.localDescription);
                })
                peerConnection.onicecandidate = (event) => {
                    if ( event.candidate ) {
                        self.socket.emit('candidate', id, event.candidate);
                    }
                }
                self.message = `Watcher with id: ${id} enter the room`;
                self.messageView = true;
            })
            self.socket.on('candidate', (id, candidate) => {
                self.peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
            })

            /* Validate broadcaster when get connected */
            self.socket.on('connect', () => {
                self.socket.emit('validate_broadcaster');
            })

            self.socket.on('validation_result', (result) => {
                if ( result.status ) {
                    if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia() ) {
                        navigator.mediaDevices.getUserMedia(constraints)
                        .then((stream) => {
                            self.video.srcObject = stream;
                            self.socket.emit('broadcaster');
                        })
                    } else { console.log('Camera is not accessible') }
                } else {
                    self.errorText = 'There is an online broadcaster rightnow'
                    self.errorView = true;
                }
            })

            self.socket.on('bye', (id) => {
                if ( self.peerConnections[id] ) {
                    self.message = `Watcher with id: ${id} has been gone`
                    self.peerConnections[id].close();
                    delete self.peerConnections[id];
                } else {
                    self.message = `One invalid broadcaster(${id}) who's tried to connect has been gone`;
                }
                self.messageView = true;
            })
        },
        play() {
            const self = this;
            if ( !self.isOnline ) {
                self.socket = io.connect('http://localhost:3000/secondary', {reconnect: true, transports: ['websocket']})
                self.socketInit();
            } else {
                self.stop();
            }
            self.isOnline = !self.isOnline;
        },
        stop() {
            const self = this;
            self.socket.disconnect();
            self.video.srcObject && self.video.srcObject.getTracks().map(t => t.stop())
            self.video.load();
        }
    },
    mounted() {
        this.video = this.$refs.video;
    },
    beforeDestroy() {
        console.log('bye');
        this.socket.disconnect();
        this.video.srcObject && this.video.srcObject.getTracks().map(t => t.stop()) // Turn video off
    }
}
</script>
<style>
video {
  max-width: 100%;
  min-width: 100%;
  height: auto;
  object-fit: fill;
  margin: 0 auto;
}
</style>