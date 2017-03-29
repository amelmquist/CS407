/**
 * Created by Steven on 3/3/2017.
 */

starter.controller('page2controller', function($scope, $state) {

  $scope.ionNavTitle = "Page2 title";
  $scope.goToNext = function() {
    $state.go('firstPage');
  };

});

