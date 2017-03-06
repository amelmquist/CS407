/**
 * Created by Steven on 3/5/2017.
 */

angular.module('ionicApp').controller('roomOptionsPageController', function($scope, $state) {

  $scope.cancelChanges = function() {
    //Todo, make this transition always go "backward" google seems to think we need to use $ionicHistory goBack
    $state.go('roomViewHost');
  };

  $scope.applyChanges = function() {
    //Todo, make this transition always go "backward" google seems to think we need to use $ionicHistory goBack
    $state.go('roomViewHost');
  };

});
