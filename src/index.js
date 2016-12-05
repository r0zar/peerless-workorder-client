/*eslint-disable*/
'use strict';

import angular from 'angular';

import 'angular-ui-router';
import routesConfig from './routes';

import {main} from './app/main';
import {aboutUs} from './app/aboutUs';
import {contactUs} from './app/contactUs';
import {nutrient} from './app/nutrient';
import {recipe} from './app/recipe';
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
  .module('Firebase', ['Sessions'])
  .service('FirebaseService', ['SessionService', (SessionService) => {
    return {
      get: (value) => {
        return firebase.database().ref(`/${value}`).once('value').then((snapshot) => {
          var response = snapshot.val();
          for (var item in response) {
            if (response[item].owner != SessionService.email) {
              delete response[item];
            }
          }
          return response;
        });
      },
      users: firebase.database().ref('users'),
      nutrients: firebase.database().ref('nutrients'),
      recipes: firebase.database().ref('recipes'),
      ingredients: firebase.database().ref('ingredients'),
      mixes: firebase.database().ref('mixes')
    }
  }]);

angular
  .module('app', ['ui.router', 'ui.bootstrap', 'ngAnimate', 'angular-uuid', 'Sessions', 'Firebase'])
  .config(routesConfig)
  .component('app', main)
  .component('aboutUs', aboutUs)
  .component('contactUs', contactUs)
  .component('nutrient', nutrient)
  .component('recipe', recipe)
  .component('mix', mix)
  .component('fountainHeader', header)
  .component('fountainTitle', title)
  .component('fountainFooter', footer)
  .controller('MixController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', 'FirebaseService', ($scope, $state, $stateParams, uuid, SessionService, FirebaseService) => {

    if (!SessionService.session) {
      $state.go('aboutUs');
    }

    FirebaseService.get('mixes')
      .then((response)=>{
        $scope.mixes = response;
        $scope.mix = $scope.mixes[$stateParams.id];
        $scope.$apply();
      });

  }])
  .controller('RecipeController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', 'FirebaseService', ($scope, $state, $stateParams, uuid, SessionService, FirebaseService) => {

    if (!SessionService.session) {
      $state.go('aboutUs');
    }

    $scope.genUuid = (type) => {
      var hash = uuid.v4();
      $scope[type].id = hash;
    }

    FirebaseService.get('nutrients')
      .then((response) => {
        $scope.nutrients = response;
      })

    FirebaseService.get('recipes')
      .then((response) => {
        $scope.recipes = response;
        $scope.recipe = $scope.recipes[$stateParams.id];
        $scope.recipe.ingredients = {};
        // had to set the listener during the call, couldnt figure out a better way
        FirebaseService.ingredients
          .on('value', function(snapshot) {
            $scope.ingredients = snapshot.val();
            for (var ingredient in $scope.ingredients) {
              // if ingredient is in the recipe
              if ($stateParams.id == $scope.ingredients[ingredient].recipe) {
                // add the body to the recipe
                $scope.recipe.ingredients[ingredient] = {
                  'name': $scope.nutrients[$scope.ingredients[ingredient].nutrient].name,
                  'amount': $scope.ingredients[ingredient].amount,
                  'unit': $scope.ingredients[ingredient].unit
                };
              }
            }
          });
        $scope.$apply();
      });

    $scope.ingredient = {};
    $scope.genUuid('ingredient');
    FirebaseService.get('ingredients')
      .then((response) => {
        $scope.ingredients = response;
        for (var ingredient in $scope.ingredients) {
          // if ingredient is in the recipe
          if ($stateParams.id == $scope.ingredients[ingredient].recipe) {
            // add the body to the recipe
            $scope.recipe.ingredients[ingredient] = {
              'name': $scope.nutrients[$scope.ingredients[ingredient].nutrient].name,
              'amount': $scope.ingredients[ingredient].amount,
              'unit': $scope.ingredients[ingredient].unit
            };
          }
        }
        $scope.$apply();
      })

      $scope.writeIngredientData = (id, nutrient, amount, unit) => {
        firebase.database().ref('ingredients/' + id).set({
          recipe: $stateParams.id,
          nutrient: nutrient,
          amount: amount,
          unit: unit,
          owner: SessionService.email
        });
        $scope.genUuid('ingredient');
      }

      $scope.calculateRecipeData = function(amount, unit) {
        var baseAmount = 0;
        var scaleFactor;
        // loop through mixes
        for (var ingredient in $scope.recipe.ingredients) {
           if (unit == 'grams') {
             if ($scope.recipe.ingredients[ingredient].unit == 'grams') {
               baseAmount = baseAmount + $scope.recipe.ingredients[ingredient].amount;
             } else {
               baseAmount = baseAmount + ($scope.recipe.ingredients[ingredient].amount * 0 );
             }
           } else {
             if ($scope.recipe.ingredients[ingredient].unit == 'grams') {
               baseAmount = baseAmount + ($scope.recipe.ingredients[ingredient].amount * 0 );
             } else {
               baseAmount = baseAmount + $scope.recipe.ingredients[ingredient].amount;
             }
           }
        }

        $scope.recipe.baseAmount = baseAmount;
        scaleFactor = amount / baseAmount;
        for (var ingredient in $scope.recipe.ingredients) {
          $scope.recipe.ingredients[ingredient] = $scope.recipe.ingredients[ingredient];
          $scope.recipe.ingredients[ingredient].amount = scaleFactor * $scope.recipe.ingredients[ingredient].amount;
        };
      }

  }])
  .controller('NutrientController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', 'FirebaseService', ($scope, $state, $stateParams, uuid, SessionService, FirebaseService) => {

    if (!SessionService.session) {
      $state.go('aboutUs');
    }

    FirebaseService.get('nutrients')
      .then((response)=>{
        $scope.nutrients = response;
        $scope.nutrient = $scope.nutrients[$stateParams.id];
        $scope.$apply();
      });

  }])
  .controller('MainController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', 'FirebaseService', ($scope, $state, $stateParams, uuid, SessionService, FirebaseService) => {
    var database = firebase.database();

    $scope.session = {
      'active': SessionService.session
    };

    $scope.login = (email, password) => {
      SessionService.session = true;
      $scope.session.active = true;
      SessionService.email = email;
      SessionService.login(email, password);
    }

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
    $scope.genUuid('recipe');
    $scope.genUuid('mix');

    FirebaseService.users
      .on('value', function(snapshot) {
        $scope.users = snapshot.val();
      });

    FirebaseService.nutrients
      .on('value', function(snapshot) {
        $scope.nutrients = snapshot.val();
        for (var nutrient in $scope.nutrients) {
          if ($scope.nutrients[nutrient].owner != SessionService.email) {
            delete $scope.nutrients[nutrient];
          }
        }
      });

    FirebaseService.ingredients
      .on('value', function(snapshot) {
        $scope.ingredients = snapshot.val();
        for (var ingredient in $scope.ingredients) {
          if ($scope.ingredients[ingredient].owner != SessionService.email) {
            delete $scope.ingredients[ingredient];
          }
        }
        for (var recipe in $scope.recipes) {
          $scope.recipes[recipe].ingredients = {};
          for (var ingredient in $scope.ingredients) {
            // if ingredient in the recipe
            if (recipe == $scope.ingredients[ingredient].recipe) {
              // add the body to the recipe
              $scope.recipes[recipe].ingredients[ingredient] = {
                'name': $scope.nutrients[$scope.ingredients[ingredient].nutrient].name,
                'amount': $scope.ingredients[ingredient].amount,
                'unit': $scope.ingredients[ingredient].unit
              };
            }
          }
        }
      });

    FirebaseService.recipes
      .on('value', function(snapshot) {
        $scope.recipes = snapshot.val();
        for (var recipe in $scope.recipes) {
          if ($scope.recipes[recipe].owner != SessionService.email) {
            delete $scope.recipes[recipe];
          }
        }
        for (var recipe in $scope.recipes) {
          $scope.recipes[recipe].ingredients = {};
          for (var ingredient in $scope.ingredients) {
            // if ingredient is in the recipe
            if (recipe == $scope.ingredients[ingredient].recipe) {
              // add the body to the recipe
              $scope.recipes[recipe].ingredients[ingredient] = {
                'name': $scope.nutrients[$scope.ingredients[ingredient].nutrient].name,
                'amount': $scope.ingredients[ingredient].amount,
                'unit': $scope.ingredients[ingredient].unit
              };
            }
          }
        }
      });

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

    $scope.writeRecipeData = function(id, name) {
      database.ref('recipes/' + id).set({
        name: name,
        owner: SessionService.email
      });
      $scope.genUuid('recipe');
    }

    $scope.goToNutrient = function(nutrient) {
      $state.go('nutrient', {id: nutrient});
    }

    $scope.goToRecipe = function(recipe) {
      $state.go('recipe', {id: recipe});
    }

    $scope.goToMix = function(mix) {
      $state.go('mix', {id: mix});
    }

  }])
  .controller('HeadController', ['$scope', '$state', 'SessionService', ($scope, $state, SessionService) => {

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

  }]);
