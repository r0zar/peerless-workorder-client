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


angular
  .module('app', [techsModule, 'ui.router', 'ui.bootstrap', 'ngAside'])
  .config(routesConfig)
  .component('app', main)
  .component('aboutUs', aboutUs)
  .component('whoWeAre', whoWeAre)
  .component('upcomingEvents', upcomingEvents)
  .component('contactUs', contactUs)
  .component('socialMedia', socialMedia)
  .controller('AsideController', ($scope, $state) => {
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
  })
  .component('fountainHeader', header)
  .component('fountainTitle', title)
  .component('fountainFooter', footer)
  .controller('TechsController', ($scope, $state) => {

      var database = firebase.database();

      getEvent1Image();
      function getEvent1Image() {
        return firebase.database().ref('/event1Image').once('value').then(function(snapshot) {
          $scope.hrefEvent1Image = snapshot.val();
          console.log($scope.hrefEvent1Image);
          $scope.$apply();
        });
      }
      getEvent2Image();
      function getEvent2Image() {
        return firebase.database().ref('/event2Image').once('value').then(function(snapshot) {
          $scope.hrefEvent2Image = snapshot.val();
          console.log($scope.hrefEvent2Image);
          $scope.$apply();
        });
      }
      getEvent3Image();
      function getEvent3Image() {
        return firebase.database().ref('/event3Image').once('value').then(function(snapshot) {
          $scope.hrefEvent3Image = snapshot.val();
          console.log($scope.hrefEvent3Image);
          $scope.$apply();
        });
      }

      getEvent1Title();
      function getEvent1Title() {
        return firebase.database().ref('/event1Title').once('value').then(function(snapshot) {
          $scope.hrefEvent1Title = snapshot.val();
          console.log($scope.hrefEvent1Title);
          $scope.$apply();
        });
      }
      getEvent2Title();
      function getEvent2Title() {
        return firebase.database().ref('/event2Title').once('value').then(function(snapshot) {
          $scope.hrefEvent2Title = snapshot.val();
          console.log($scope.hrefEvent2Title);
          $scope.$apply();
        });
      }
      getEvent3Title();
      function getEvent3Title() {
        return firebase.database().ref('/event3Title').once('value').then(function(snapshot) {
          $scope.hrefEvent3Title = snapshot.val();
          console.log($scope.hrefEvent3Title);
          $scope.$apply();
        });
      }

      getEvent1Date();
      function getEvent1Date() {
        return firebase.database().ref('/event1Date').once('value').then(function(snapshot) {
          $scope.hrefEvent1Date = snapshot.val();
          console.log($scope.hrefEvent1Date);
          $scope.$apply();
        });
      }
      getEvent2Date();
      function getEvent2Date() {
        return firebase.database().ref('/event2Date').once('value').then(function(snapshot) {
          $scope.hrefEvent2Date = snapshot.val();
          console.log($scope.hrefEvent2Date);
          $scope.$apply();
        });
      }
      getEvent3Date();
      function getEvent3Date() {
        return firebase.database().ref('/event3Date').once('value').then(function(snapshot) {
          $scope.hrefEvent3Date = snapshot.val();
          console.log($scope.hrefEvent3Date);
          $scope.$apply();
        });
      }

      getEvent1Link();
      function getEvent1Link() {
        return firebase.database().ref('/event1Link').once('value').then(function(snapshot) {
          $scope.hrefEvent1Link = snapshot.val();
          console.log($scope.hrefEvent1Link);
          $scope.$apply();
        });
      }
      getEvent2Link();
      function getEvent2Link() {
        return firebase.database().ref('/event2Link').once('value').then(function(snapshot) {
          $scope.hrefEvent2Link = snapshot.val();
          console.log($scope.hrefEvent2Link);
          $scope.$apply();
        });
      }
      getEvent3Link();
      function getEvent3Link() {
        return firebase.database().ref('/event3Link').once('value').then(function(snapshot) {
          $scope.hrefEvent3Link = snapshot.val();
          console.log($scope.hrefEvent3Link);
          $scope.$apply();
        });
      }

  })
  .controller('MainController', ($scope, $state) => {

    var database = firebase.database();

    getWideImage1();
    function getWideImage1() {
      return firebase.database().ref('/wideImage1').once('value').then(function(snapshot) {
        $scope.hrefWideImage1 = snapshot.val();
        console.log($scope.hrefWideImage1);
        $scope.$apply();
      });
    }
    getWideImage2();
    function getWideImage2() {
      return firebase.database().ref('/wideImage2').once('value').then(function(snapshot) {
        $scope.hrefWideImage2 = snapshot.val();
        console.log($scope.hrefWideImage2);
        $scope.$apply();
      });
    }
    getWideImage3();
    function getWideImage3() {
      return firebase.database().ref('/wideImage3').once('value').then(function(snapshot) {
        $scope.hrefWideImage3 = snapshot.val();
        console.log($scope.hrefWideImage3);
        $scope.$apply();
      });
    }

  })
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

    getSocialMedia1();
    getSocialMedia2();
    getSocialMedia3();
    getLogo();

    $scope.test = () => {
      console.log($scope);
    }

    var database = firebase.database();

    function getSocialMedia1() {
      return firebase.database().ref('/socialMedia1').once('value').then(function(snapshot) {
        $scope.hrefSocialMedia1 = snapshot.val();
        console.log($scope.hrefSocialMedia1);
        $scope.$apply();
      });
    }
    function getSocialMedia2() {
      return firebase.database().ref('/socialMedia2').once('value').then(function(snapshot) {
        $scope.hrefSocialMedia2 = snapshot.val();
        console.log($scope.hrefSocialMedia2);
        $scope.$apply();
      });
    }
    function getSocialMedia3() {
      return firebase.database().ref('/socialMedia3').once('value').then(function(snapshot) {
        $scope.hrefSocialMedia3 = snapshot.val();
        console.log($scope.hrefSocialMedia3);
        $scope.$apply();
      });
    }

    function getLogo() {
      return firebase.database().ref('/logo').once('value').then(function(snapshot) {
        $scope.hrefLogo = snapshot.val();
        console.log($scope.hrefLogo);
        $scope.$apply();
      });
    }


    $scope.goHome = () => {
      $state.go('app')
      //console.log($scope.hrefLogo);
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
        controller: ($scope, $uibModalInstance) => {
          $scope.ok = (e) => {
            $uibModalInstance.close();
            e.stopPropagation();
          };
          $scope.cancel = (e) => {
            $uibModalInstance.dismiss();
            e.stopPropagation();
          };
        }
      }).result.then(postClose, postClose);
    };
  }]);
