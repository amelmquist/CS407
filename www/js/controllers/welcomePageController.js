/**
 * Created by Steven on 3/3/2017.
 */

angular.module('ionicApp').controller('welcomePageController', function($scope, $state) {

  $scope.goToNext = function() {
    $state.go('routingPage');
  };

});
