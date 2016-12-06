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
    .state('contactUs', {
      url: '/contact-us',
      component: 'contactUs'
    })
    .state('nutrient', {
      url: '/nutrient/:id',
      component: 'nutrient'
    })
    .state('recipe', {
      url: '/recipe/:id',
      component: 'recipe'
    })
    .state('mix', {
      url: '/mix/:id',
      component: 'mix'
    })
    .state('nutrientHistory', {
      url: '/nutrient/:id/history',
      component: 'nutrientHistory'
    })
    .state('recipeHistory', {
      url: '/recipe/:id/history',
      component: 'recipeHistory'
    })
    .state('mixHistory', {
      url: '/mix/:id/history',
      component: 'mixHistory'
    });
}
