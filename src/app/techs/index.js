import angular from 'angular';

import {techs} from './techs';

export const techsModule = 'techs';

angular
  .module(techsModule, [])
  .component('fountainTechs', techs);
