/*eslint-disable*/
'use strict';

import angular from 'angular';

import 'angular-ui-router';
import routesConfig from './routes';

import {main} from './app/main';
import {aboutUs} from './app/aboutUs';
import {contactUs} from './app/contactUs';
import {nutrient} from './app/nutrient';
import {mix} from './app/mix';
import {header} from './app/header';
import {title} from './app/title';
import {footer} from './app/footer';

import './index.scss';
import 'angular-uuid';
import 'angular-animate';
import 'angular-ui-bootstrap';

angular
  .module('Sessions', [])
  .service('SessionService', ['$state', ($state) => {
    return {
      login: (email, password) => {
        return firebase.auth().signInWithEmailAndPassword(email, password).then(()=>{
          $state.go('app');
        });
      },
      logout: () => {
        return firebase.auth().signOut().then(() => {
          $state.go('aboutUs');
        });
      },
      session: false,
      email: null
    }
  }]);

angular
  .module('app', ['ui.router', 'ui.bootstrap', 'ngAnimate', 'angular-uuid', 'Sessions'])
  .config(routesConfig)
  .component('app', main)
  .component('aboutUs', aboutUs)
  .component('contactUs', contactUs)
  .component('nutrient', nutrient)
  .component('mix', mix)
  .component('fountainHeader', header)
  .component('fountainTitle', title)
  .component('fountainFooter', footer)
  .controller('MixController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', ($scope, $state, $stateParams, uuid, SessionService) => {

    var database = firebase.database();
    function get(value){
      return database.ref(`/${value}`).once('value').then(function(snapshot) {
        $scope[value] = snapshot.val();
      });
    }
    $scope.mixes = {};
    get('mixes').then(()=>{
      $scope.mix = $scope.mixes[$stateParams.id];
      $scope.$apply();
    });

  }])
  .controller('NutrientController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', ($scope, $state, $stateParams, uuid, SessionService) => {

    var database = firebase.database();
    function get(value){
      return database.ref(`/${value}`).once('value').then(function(snapshot) {
        $scope[value] = snapshot.val();
      });
    }
    $scope.nutrients = {};
    get('nutrients').then(()=>{
      $scope.nutrient = $scope.nutrients[$stateParams.id];
      $scope.$apply();
    });

  }])
  .controller('MainController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', ($scope, $state, $stateParams, uuid, SessionService) => {
  console.log($scope);
    var database = firebase.database();
    function get(value){
      return database.ref(`/${value}`).once('value').then(function(snapshot) {
        $scope[value] = snapshot.val();
      });
    }


    $scope.session = {
      'active': SessionService.session
    };

    $scope.login = (email, password) => {
      SessionService.session = true;
      $scope.session.active = true;
      SessionService.email = email;
      SessionService.login(email, password);
    }

    $scope.users = {}
    $scope.mixes = {}
    $scope.nutrients = {}
    $scope.ingredients = {}

    var usersRef = database.ref('users');
    var mixesRef = database.ref('mixes');
    var nutrientsRef = database.ref('nutrients');
    var ingredientsRef = database.ref('ingredients');

    usersRef.on('value', function(snapshot) {
      $scope.users = snapshot.val();
    });

    nutrientsRef.on('value', function(snapshot) {
      $scope.nutrients = snapshot.val();
      for (var nutrient in $scope.nutrients) {
        if ($scope.nutrients[nutrient].owner != SessionService.email) {
          delete $scope.nutrients[nutrient];
        }
      }
    });

    ingredientsRef.on('value', function(snapshot) {
      $scope.ingredients = snapshot.val();
      for (var ingredient in $scope.ingredients) {
        if ($scope.ingredients[ingredient].owner != SessionService.email) {
          delete $scope.ingredients[ingredient];
        }
      }
      for (var mix in $scope.mixes) {
        $scope.mixes[mix].ingredients = {};
        // skip loop if the property is from prototype
        for (var ingredient in $scope.ingredients) {
          // if ingredient is mapped to the mix
          if (mix == $scope.ingredients[ingredient].mix) {
            // add it as an ingredient in the mix
            $scope.mixes[mix].ingredients[ingredient] = {
              'name': $scope.nutrients[$scope.ingredients[ingredient].nutrient].name,
              'amount': $scope.ingredients[ingredient].amount,
              'unit': $scope.ingredients[ingredient].unit
            };
          }
        }
      }
    });

    mixesRef.on('value', function(snapshot) {
      $scope.mixes = snapshot.val();
      for (var mix in $scope.mixes) {
        if ($scope.mixes[mix].owner != SessionService.email) {
          delete $scope.mixes[mix];
        }
      }
      for (var mix in $scope.mixes) {
        $scope.mixes[mix].ingredients = {};
        // skip loop if the property is from prototype
        for (var ingredient in $scope.ingredients) {
          // if ingredient is mapped to the mix
          if (mix == $scope.ingredients[ingredient].mix) {
            // add it as an ingredient in the mix
            $scope.mixes[mix].ingredients[ingredient] = {
              'name': $scope.nutrients[$scope.ingredients[ingredient].nutrient].name,
              'amount': $scope.ingredients[ingredient].amount,
              'unit': $scope.ingredients[ingredient].unit
            };
          }
        }
      }
    });



    $scope.user = {};
    $scope.nutrient = {};
    $scope.ingredient = {};
    $scope.recipe = {};
    $scope.mix = {};

    $scope.genUuid = (type) => {
      var hash = uuid.v4();
      $scope[type].id = hash;
    }

    $scope.genUuid('nutrient');
    $scope.genUuid('ingredient');
    $scope.genUuid('mix');

    $scope.writeUserData = function(id, name, email) {
      database.ref('users/' + id).set({
        username: name,
        email: email
      });
    }

    $scope.writeNutrientData = function(id, name, amount, unit) {
     database.ref('nutrients/' + id).set({
       name: name,
       amount: amount,
       unit: unit,
       owner: SessionService.email
     });
     $scope.genUuid('nutrient');
   }

   $scope.updateNutrientData = function(name, amount, unit) {
    database.ref('nutrients/' + $stateParams.id).set({
      name: name,
      amount: amount,
      unit: unit,
      owner: SessionService.email
    });
  }

   $scope.writeIngredientData = function(id, mix, nutrient, amount, unit) {
    database.ref('ingredients/' + id).set({
      mix: mix,
      nutrient: nutrient,
      amount: amount,
      unit: unit,
      owner: SessionService.email
    });
    $scope.genUuid('ingredient');
  }

   $scope.writeMixData = function(id, name) {
    database.ref('mixes/' + id).set({
      name: name,
      owner: SessionService.email
    });
    $scope.genUuid('mix');
  }


  $scope.goToNutrient = function(nutrient) {
    $scope.nutrient = $scope.nutrients[$stateParams.id]
    $state.go('nutrient', {id: nutrient});
  }


  $scope.goToMix = function(mix) {
    $scope.mix = $scope.mixes[$stateParams.id]
    $state.go('mix', {id: mix});
  }

   $scope.calculateRecipeData = function(id, mix, amount, unit) {
     var baseAmount = 0;
     var scaleFactor;
     var mix = $scope.mixes[mix]
     // loop through mixes
     for (var ingredient in mix.ingredients) {
        if (unit == 'pounds') {
          if (mix.ingredients[ingredient].unit == 'pounds') {
            baseAmount = baseAmount + mix.ingredients[ingredient].amount;
          } else {
            baseAmount = baseAmount + (mix.ingredients[ingredient].amount * 2.20462 );
          }
        } else {
          if (mix.ingredients[ingredient].unit == 'pounds') {
            baseAmount = baseAmount + (mix.ingredients[ingredient].amount * 0.453592 );
          } else {
            baseAmount = baseAmount + mix.ingredients[ingredient].amount;
          }
        }
     }

     mix.baseAmount = baseAmount;
     scaleFactor = amount / baseAmount;
     $scope.recipe.ingredients = {};
     for (var ingredient in mix.ingredients) {
       $scope.recipe.ingredients[ingredient] = mix.ingredients[ingredient];
       $scope.recipe.ingredients[ingredient].amount = scaleFactor * $scope.recipe.ingredients[ingredient].amount;
     };
   }

  }])
  .controller('HeadController', ['$scope', '$state', 'SessionService', ($scope, $state, SessionService) => {

    var database = firebase.database();
    function get(value){
      return firebase.database().ref(`/${value}`).once('value').then(function(snapshot) {
        $scope[value] = snapshot.val();
      });
    }

    //$state.go("nutrient", {id: 1});

    $scope.session = {
      'active': SessionService.session
    };

    $scope.logout = () => {
      SessionService.session = false;
      $scope.session.active = false;
      SessionService.email = null;
      SessionService.logout();
    }

    if (!SessionService.session && $state.current.name=='app') {
      $state.go('aboutUs');
    }

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
