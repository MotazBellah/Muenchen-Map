var map;
var markers = [];
// List of location with lat/lng
var locations = [
      {title: 'Frauenkirche',
      location: {lat: 48.136499454, lng: 11.570997716},
      id: 0
  },
      {title: 'BMW Museum',
      location: {lat: 48.177, lng: 11.559},
      id: 1
  },
      {title: 'Englischer Garten',
      location: {lat: 48.163841, lng: 11.605538},
      id: 2
  },
      {title: 'Deutsches Museum',
      location: {lat: 48.129871, lng: 11.583452},
      id: 3
  },
      {title: 'Neuschwanstein Castle',
      location: {lat: 47.557732, lng: 10.749646},
      id: 4
  },
      {title: 'Nymphenburg Palace',
      location: {lat: 48.158056, lng: 11.503611},
      id: 5
  },
      {title: 'Marienplatz',
      location: {lat: 48.135666124, lng: 11.571831046},
      id: 6
  },
      {title: 'National Theatre Munich',
      location: {lat: 48.136999452, lng: 11.574331036},
      id: 7
  },
      {title: 'Bavarian State Library',
      location: {lat: 48.1416661, lng: 11.5749977},
      id: 8
  },
    {title: 'Olympic Village, Munich',
    location: {lat: 48.175665964, lng: 11.550497798},
    id: 9
},
    {title: 'Cuvillies Theatre',
    location: {lat: 48.137332784, lng: 11.573997704},
    id: 10
    }
];

//Creating Place with 3 observable variable
var Place = function (data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.id = ko.observable(data.id)
};
//Our ViewModel that responsible for render the webpage with changing
var ViewModel = function () {
    var self = this;
    //Create a placeList array
    this.placeList = ko.observableArray([]);
    //Create filter, that we use to binf it with input fied on HTML
    this.filter = ko.observable();
    //Loop through each place and add it in place list
    locations.forEach(function (location) {
        self.placeList.push(new Place(location));
    });

    //Create a computed variable and bind it to ul element on html
    //This function at first show all marker on the map
    // return only the places that match with the filter, and hide other markers from the map
    this.visiblePlaces = ko.computed(function(){
        for (var i = 0; i < markers.length; i++) {
            marker = markers[i]
            marker.setVisible(true);
        }
       return this.placeList().filter(function(place){
           if(!self.filter() || place.title().toLowerCase().includes(self.filter().toLowerCase())){
               return place;
           }
           markers[place.id()].setVisible(false);
       });

   },this);


    this.currentPlace = ko.observable(this.placeList()[0]);
    //Using setPlace function and bind it to li element to show the info that related to that element
    this.setPlace = function (place) {
       self.currentPlace(place);
       i = self.currentPlace().id();
       toggleBounce(markers[i]);
       populateInfoWindow(markers[i])
   };

};

ko.applyBindings(new ViewModel());

//creat the map
function initMap() {
    //create map and use lat/lng for munchen germany
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 48.137154, lng: 11.576124},
        zoom: 13
    });

    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var position = locations[i].location;
      var title = locations[i].title;
      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
      });

      markers.push(marker)

      //Add event addListener that responsible to animate the marker and open the infowindow
      marker.addListener('click', function () {
        populateInfoWindow(this);//function responsible to open the info InfoWindow
                                // and display the info related to the marker
        toggleBounce(this);// responsible for animate the marker
      });

      bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

//Use to add animation for the marker
function toggleBounce(marker) {
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    }

// open info windo and get the data and image that related to that place
function populateInfoWindow(marker) {
    getData(marker.title); //get info about the place
    getPhoto(marker.title) //get image about the place
    var infowindow = new google.maps.InfoWindow();
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
     infowindow.setContent('<div>' + marker.title + '</div>');

    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    //hide the image and the data
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
      $('#output').html('');
      $('#photo').attr('src', '');
    });
    }
}

//the function used to get the photo of selected item/markers
//using flickerAPI to get the image through ajax request
function getPhoto(info) {
    //set time out, so if time out passed without get any info alert the user
    var requestTimeout = setTimeout(function () {
        alert('Failed to get Flicker resourses');
    }, 8000);
    // add flickerAPI and flickerOption, and define tags that used for searching, and response format in json
    var flickerAPI = 'https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?'
    var flickerOption = {
        tags: info,
        format: 'json'
    };
    //send request to get the data from flicker
    $.getJSON(flickerAPI, flickerOption, function functionName(response) {
        // console.log(response['items'][0]['media']['m']);
        //show the photo on the html
        var photoUrl = response['items'][0]['media']['m'];
        $('#photo').attr('src', photoUrl);
        clearTimeout(requestTimeout); //clear time out in case of success
    });

}

//the function used to get the info of selected item/markers
//using wikipediaAPI to get the data through ajax request
function getData(info) {
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + info + '&format=json&callback=?';
    //set time out, so if time out passed without get any info alert the user
    var requestTimeout = setTimeout(function () {
        alert('Failed to get wikipedia resourses');
    }, 8000);
    //send request to get the data from wikipedia
    $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        success: function (response) {
            $('#output').html('');
            // in case no info comes from the wikipedia
            if (response.length == 0) {
                $('#output').prepend('<p><strong> There is no data ti display!</strong></p>');
            }
            else{
                // console.log(response)
                // Through each item and add it to html
                $('#output').html('<h3>'+response[0]+'</h3>')
                for (var i = 0; i < response[1].length; i++) {
                        $('#output').append('<p><strong>'+response[2][i]+'</strong></p>');
                }
            }
            clearTimeout(requestTimeout); //clear time out in case of success
        },
         error: function(){
              alert("Failed to get wikipedia resourses");
          }
    });
}
