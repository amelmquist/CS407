starter.controller('routingPageController', function($rootScope, $scope, $state, $ionicViewSwitcher) {
  console.log($rootScope);
  $scope.joinRoom = function() {
    $state.go('roomViewGuest');
  };

  $scope.createRoom = function() {
    $state.go('roomBuilderPage');
  };

  $scope.exitToWelcomePage = function() {
    $ionicViewSwitcher.nextDirection('back');
    $state.go('welcomePage');
  }

});
