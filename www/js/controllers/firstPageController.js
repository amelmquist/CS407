/**
 * Created by Steven on 3/3/2017.
 */

starter.controller('page1controller', function($scope, $state) {

  $scope.goToNext = function() {
    $state.go('secondPage');
  };

});
