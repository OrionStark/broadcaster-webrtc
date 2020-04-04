import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
import PrimaryBroadcaster from './components/PrimaryBroadcast.vue';
import SecondaryBroadcaster from './components/SecondaryBroadcaster.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            component: HelloWorld,
            name: 'HELLO WORLD'
        },
        {
            path: '/primary-broadcaster',
            component: PrimaryBroadcaster,
            name: 'BROADCASTER PRIMARY'
        },
        {
            path: '/secondary-broadcaster',
            component: SecondaryBroadcaster,
            name: 'BROADCASTER SECONDARY'
        }
    ]
})