/* eslint linebreak-style: ["error", "windows"] */
export default routesConfig;

/** @ngInject */
function routesConfig($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('app', {
      url: '/',
      component: 'app'
    })
    .state('aboutUs', {
      url: '/about-us',
      component: 'aboutUs'
    })
    .state('whoWeAre', {
      url: '/who-we-are',
      component: 'whoWeAre'
    })
    .state('upcomingEvents', {
      url: '/upcoming-events',
      component: 'upcomingEvents'
    })
    .state('contactUs', {
      url: '/contact-us',
      component: 'contactUs'
    })
    .state('socialMedia', {
      url: '/social-media',
      component: 'socialMedia'
    });
}
