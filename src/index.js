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
import {nutrientHistory} from './app/nutrientHistory';
import {mixHistory} from './app/mixHistory';
import {recipeHistory} from './app/recipeHistory';
import {header} from './app/header';
import {title} from './app/title';
import {footer} from './app/footer';

import './index.scss';
import 'angular-uuid';
import 'angular-ui-bootstrap';
import 'moment';

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
            if (response[item].owner.toLowerCase() != SessionService.email.toLowerCase()) {
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
  .component('nutrientHistory', nutrientHistory)
  .component('mixHistory', mixHistory)
  .component('recipeHistory', recipeHistory)
  .component('fountainHeader', header)
  .component('fountainTitle', title)
  .component('fountainFooter', footer)
  .controller('MixController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', 'FirebaseService', ($scope, $state, $stateParams, uuid, SessionService, FirebaseService) => {

    if (!SessionService.session) {
      $state.go('aboutUs');
    }

    $scope.id = $stateParams.id;

    FirebaseService.get('mixes')
      .then((response)=>{
        $scope.mixes = response;
        $scope.mix = $scope.mixes[$stateParams.id];
        $scope.$apply();
      });

    $scope.viewHistory = (mix) => {
      $state.go('mixHistory', {id: mix});
    }

  }])
  .controller('MixHistoryController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', 'FirebaseService', ($scope, $state, $stateParams, uuid, SessionService, FirebaseService) => {

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
  .controller('RecipeController', ['$scope', '$state', '$stateParams', 'uuid', '$location', '$anchorScroll', 'SessionService', 'FirebaseService', ($scope, $state, $stateParams, uuid, $location, $anchorScroll, SessionService, FirebaseService) => {

    if (!SessionService.session) {
      $state.go('aboutUs');
    }

    $scope.id = $stateParams.id;

    $scope.viewHistory = (recipe) => {
      $state.go('recipeHistory', {id: recipe});
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
    $scope.mix = {};
    $scope.genUuid('mix');
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
        var event = {
          action: "ADD",
          amount: amount,
          unit: unit,
          nutrient: {'id': nutrient, 'name': $scope.nutrients[nutrient].name, 'owner': $scope.nutrients[nutrient].owner},
          owner: SessionService.email,
          date: moment().format()
        }
        $scope.recipe.history.push(event);
        firebase.database().ref('recipes/' + $stateParams.id).set({
          name: $scope.recipe.name,
          ingredients: $scope.recipe.ingredients,
          owner: SessionService.email,
          history: $scope.recipe.history
        });
        // TODO: create an ADD/REMOVE event for the nutrient showing its link/unlink in the recipe?
      }

      $scope.writeNutrientData = function(id, name, amount, unit) {
        firebase.database().ref('nutrients/' + id).set({
         name: name,
         amount: amount,
         unit: unit,
         owner: SessionService.email
        });
      }

      $scope.writeMixData = function(id, name, amount, unit, recipe) {
        var history = [{
          action: "CREATE",
          amount: amount,
          unit: unit,
          owner: SessionService.email,
          date: moment().format()
        }];
        firebase.database().ref('mixes/' + id).set({
          name: name,
          amount: amount,
          unit: unit,
          recipe: recipe,
          owner: SessionService.email,
          history: history
        });
        $scope.genUuid('mix');
        var event = {
          action: "MIX",
          amount: amount,
          unit: unit,
          mix: $scope.mix,
          owner: SessionService.email,
          date: moment().format()
        }
        $scope.recipe.history.push(event);
        firebase.database().ref('recipes/' + $stateParams.id).set({
          name: $scope.recipe.name,
          ingredients: $scope.recipe.ingredients,
          owner: SessionService.email,
          history: $scope.recipe.history
        });
      }

      $scope.removeIngredientData = (id) => {
        var event = {
          action: "REMOVE",
          amount: $scope.recipe.ingredients[id].amount,
          unit: $scope.recipe.ingredients[id].unit,
          nutrient: {'id': $scope.ingredients[id].nutrient, 'name' : $scope.recipe.ingredients[id].name, 'owner' : $scope.ingredients[id].owner},
          owner: SessionService.email,
          date: moment().format()
        }
        $scope.recipe.history.push(event);
        firebase.database().ref('recipes/' + $stateParams.id).set({
          name: $scope.recipe.name,
          ingredients: $scope.recipe.ingredients,
          owner: SessionService.email,
          history: $scope.recipe.history
        });
        firebase.database().ref('ingredients/' + id).remove();
        delete $scope.recipe.ingredients[id];
      }

      $scope.calculateRecipeData = function(amount, unit) {
        var baseAmount = 0;
        var scaleFactor;
        // loop through mixes
        for (var ingredient in $scope.recipe.ingredients) {
           if (unit == 'g') {
             if ($scope.recipe.ingredients[ingredient].unit == 'g') {
               baseAmount = baseAmount + $scope.recipe.ingredients[ingredient].amount;
             } else {
               baseAmount = baseAmount + ($scope.recipe.ingredients[ingredient].amount * 1 );
             }
           } else {
             if ($scope.recipe.ingredients[ingredient].unit == 'g') {
               baseAmount = baseAmount + ($scope.recipe.ingredients[ingredient].amount * 1 );
             } else {
               baseAmount = baseAmount + $scope.recipe.ingredients[ingredient].amount;
             }
           }
        }

        $scope.recipe.baseAmount = baseAmount;
        scaleFactor = amount / baseAmount;
        for (var ingredient in $scope.recipe.ingredients) {
          $scope.recipe.ingredients[ingredient].amount = scaleFactor * $scope.recipe.ingredients[ingredient].amount;
        };

        $location.hash('recipe');
        $anchorScroll();
      }

      $scope.createMixData = function(name, amount, unit) {
        var baseAmount = 0;
        var scaleFactor;
        // loop through mixes
        for (var ingredient in $scope.recipe.ingredients) {
           if (unit == 'g') {
             if ($scope.recipe.ingredients[ingredient].unit == 'g') {
               baseAmount = baseAmount + $scope.recipe.ingredients[ingredient].amount;
             } else {
               baseAmount = baseAmount + ($scope.recipe.ingredients[ingredient].amount * 1 );
             }
           } else {
             if ($scope.recipe.ingredients[ingredient].unit == 'g') {
               baseAmount = baseAmount + ($scope.recipe.ingredients[ingredient].amount * 1 );
             } else {
               baseAmount = baseAmount + $scope.recipe.ingredients[ingredient].amount;
             }
           }
        }

        $scope.recipe.baseAmount = baseAmount;
        scaleFactor = amount / baseAmount;
        for (var ingredient in $scope.recipe.ingredients) {
          // add the event to their history
          var nutrient = $scope.nutrients[$scope.ingredients[ingredient].nutrient];
          var event = {
            action: "MIX",
            amount: $scope.recipe.ingredients[ingredient].amount,
            unit: nutrient.unit,
            mix: $scope.mix,
            owner: SessionService.email,
            date: moment().format()
          };
          $scope.recipe.ingredients[ingredient].amount = scaleFactor * $scope.recipe.ingredients[ingredient].amount;
          nutrient.history.push(event);
          firebase.database().ref('nutrients/' + $scope.ingredients[ingredient].nutrient).set({
           name: nutrient.name,
           amount: nutrient.amount - $scope.recipe.ingredients[ingredient].amount,
           unit: nutrient.unit,
           owner: SessionService.email,
           history: nutrient.history
          });
        };
        $scope.writeMixData($scope.mix.id, name, amount, unit, $scope.recipe);

        $location.hash('recipe');
        $anchorScroll();
      }

  }])
  .controller('RecipeHistoryController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', 'FirebaseService', ($scope, $state, $stateParams, uuid, SessionService, FirebaseService) => {

    if (!SessionService.session) {
      $state.go('aboutUs');
    }

    FirebaseService.get('recipes')
      .then((response)=>{
        $scope.recipes = response;
        $scope.recipe = $scope.recipes[$stateParams.id];
        $scope.recipe.ingredients = {};
        $scope.$apply();
      });

    FirebaseService.get('nutrients')
      .then((response) => {
        $scope.nutrients = response;
      })

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

  }])
  .controller('NutrientController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', 'FirebaseService', ($scope, $state, $stateParams, uuid, SessionService, FirebaseService) => {

    if (!SessionService.session) {
      $state.go('aboutUs');
    }

    $scope.id = $stateParams.id;

    FirebaseService.get('nutrients')
      .then((response)=>{
        $scope.nutrients = response;
        $scope.nutrient = $scope.nutrients[$stateParams.id];
        $scope.$apply();
      });

    $scope.increaseNutrientData = (id, name, amount, unit) => {
      var event = {
        action: "INCREASE",
        amount: amount,
        unit: unit,
        owner: SessionService.email,
        date: moment().format()
      }
      $scope.nutrient.history.push(event)
      $scope.nutrient.amount = $scope.nutrient.amount + amount;
      firebase.database().ref('nutrients/' + id).set({
       name: name,
       amount: $scope.nutrient.amount,
       unit: unit,
       owner: SessionService.email,
       history: $scope.nutrient.history
      });
    }

    $scope.viewHistory = (nutrient) => {
      $state.go('nutrientHistory', {id: nutrient})
    }

  }])
  .controller('NutrientHistoryController', ['$scope', '$state', '$stateParams', 'uuid', 'SessionService', 'FirebaseService', ($scope, $state, $stateParams, uuid, SessionService, FirebaseService) => {

    if (!SessionService.session) {
      $state.go('aboutUs');
    }

    $scope.id = $stateParams.id;

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
          if ($scope.nutrients[nutrient].owner.toLowerCase() != SessionService.email.toLowerCase()) {
            delete $scope.nutrients[nutrient];
          }
        }
      });

    FirebaseService.ingredients
      .on('value', function(snapshot) {
        $scope.ingredients = snapshot.val();
        for (var ingredient in $scope.ingredients) {
          if ($scope.ingredients[ingredient].owner.toLowerCase() != SessionService.email.toLowerCase()) {
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
          if ($scope.recipes[recipe].owner.toLowerCase() != SessionService.email.toLowerCase()) {
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

      FirebaseService.mixes
        .on('value', function(snapshot) {
          $scope.mixes = snapshot.val();
          for (var mix in $scope.mixes) {
            if ($scope.mixes[mix].owner.toLowerCase() != SessionService.email.toLowerCase()) {
              delete $scope.mixes[mix];
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
      var history = [
        {
          action: "CREATE",
          amount: amount,
          unit: unit,
          owner: SessionService.email,
          date: moment().format()
        }
      ]
      database.ref('nutrients/' + id).set({
       name: name,
       amount: amount,
       unit: unit,
       owner: SessionService.email,
       history: history
      });
      $scope.genUuid('nutrient');
    }

    $scope.writeRecipeData = function(id, name) {
      var history = [
        {
          action: "CREATE",
          owner: SessionService.email,
          date: moment().format()
        }
      ]
      database.ref('recipes/' + id).set({
        name: name,
        owner: SessionService.email,
        history: history
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
