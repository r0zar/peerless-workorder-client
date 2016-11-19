/*eslint-disable*/
'use strict';

import angular from 'angular';

import {techsModule} from './app/techs/index';
import 'angular-ui-router';
import routesConfig from './routes';

import {main} from './app/main';
import {aboutUs} from './app/aboutUs';
import {whoWeAre} from './app/whoWeAre';
import {upcomingEvents} from './app/upcomingEvents';
import {contactUs} from './app/contactUs';
import {socialMedia} from './app/socialMedia';
import {header} from './app/header';
import {title} from './app/title';
import {footer} from './app/footer';
import {aside} from './aside';

import './index.scss';
import 'angular-ui-bootstrap';
import 'angular-aside';
import 'angular-animate';
import 'v-tabs';


angular
  .module('app', [techsModule, 'ui.router', 'ui.bootstrap', 'ngAside', 'ngAnimate', 'vTabs'])
  .config(routesConfig)
  .component('app', main)
  .component('aboutUs', aboutUs)
  .component('whoWeAre', whoWeAre)
  .component('upcomingEvents', upcomingEvents)
  .component('contactUs', contactUs)
  .component('socialMedia', socialMedia)
  .controller('AsideController', ['$scope', '$state', ($scope, $state) => {
      $scope.aboutUs = () => {
        $state.go('aboutUs')
      }
      $scope.whoWeAre = () => {
        $state.go('whoWeAre')
      }
      $scope.upcomingEvents = () => {
        $state.go('upcomingEvents')
      }
      $scope.contactUs = () => {
        $state.go('contactUs')
      }
      $scope.socialMedia = () => {
        $state.go('socialMedia')
      }
  }])
  .component('fountainHeader', header)
  .component('fountainTitle', title)
  .component('fountainFooter', footer)
  .controller('TechsController', ['$scope', '$state', ($scope, $state) => {

      $scope.event1Loaded = false;
      $scope.event2Loaded = false;
      $scope.event3Loaded = false;

      var database = firebase.database();
      function get(value){
        return firebase.database().ref(`/${value}`).once('value').then(function(snapshot) {
          $scope[value] = snapshot.val();
          if (value.includes('event1Image')) {
            $scope.event1Loaded = true;
          }
          if (value.includes('event2Image')) {
            $scope.event2Loaded = true;
          }
          if (value.includes('event3Image')) {
            $scope.event3Loaded = true;
          }
          $scope.$apply();
        });
      }

      get('event1Image');
      get('event2Image');
      get('event3Image');

      get('event1Title');
      get('event2Title');
      get('event3Title');

      get('event1Date');
      get('event2Date');
      get('event3Date');

      get('event1Link');
      get('event2Link');
      get('event3Link');

  }])
  .controller('MainController', ['$scope', '$state', ($scope, $state) => {

    $scope.carouselLoaded = false;
    $scope.loaded = 0;

    var database = firebase.database();
    function get(value){
      return firebase.database().ref(`/${value}`).once('value').then(function(snapshot) {
        $scope[value] = snapshot.val();
        if (value.includes('wideImage')) {
          $scope.loaded++;
        }
        if ($scope.loaded == 6) {
          $scope.carouselLoaded = true;
        }
        $scope.$apply();
      });
    }
    $scope.scopeWorkingVariable = true;

    get('wideImage1');
    get('wideImage2');
    get('wideImage3');

    get('wideImage1Link');
    get('wideImage2Link');
    get('wideImage3Link');

    // techs stuff
    get('event1Image');
    get('event2Image');
    get('event3Image');

    get('event1Title');
    get('event2Title');
    get('event3Title');

    get('event1Date');
    get('event2Date');
    get('event3Date');

    get('event1Link');
    get('event2Link');
    get('event3Link');

  }])
  .controller('HeadController', ['$scope', '$aside', '$state', ($scope, $aside, $state) => {
    firebase.auth().signInWithEmailAndPassword('rossragsdale@gmail.com', 'shandeez')
    .then(function(response) {
      console.log('Logged In.');
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
    });

    var database = firebase.database();
    function get(value){
      return firebase.database().ref(`/${value}`).once('value').then(function(snapshot) {
        $scope[value] = snapshot.val();
        $scope.$apply();
      });
    }

    get('socialMedia1');
    get('socialMedia2');
    get('socialMedia3');

    $scope.goHome = () => {
      $state.go('app')
    }

    $scope.asideState = {
      open: false
    };

    $scope.openAside = (position, backdrop) => {
      $scope.asideState = {
        open: true,
        position: position
      };

      function postClose() {
        $scope.asideState.open = false;
      }

      $aside.open({
        templateUrl: 'aside.html',
        placement: position,
        size: 'sm',
        backdrop: backdrop,
        controller: ['$scope', '$uibModalInstance', ($scope, $uibModalInstance) => {
          $scope.ok = (e) => {
            $uibModalInstance.close();
            e.stopPropagation();
          };
          $scope.cancel = (e) => {
            $uibModalInstance.dismiss();
            e.stopPropagation();
          };
        }]
      }).result.then(postClose, postClose);
    };
  }]);
