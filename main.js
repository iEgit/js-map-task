var onload = (function () {
	function highlight (url) {
		 $link = $('#' + (url.path.replace(/[#\/]/g,'') || 'main')  + '-link');
		 $link.parent().toggleClass('active');
		 $link.parent().siblings().removeClass('active')
	}
	function template (url) {
		return $('#' + (url.path.replace(/[#\/]/g,'') || 'main') + '-template');
	}	
	function reduceFn (previousValue, currentValue, index, array) {
	// algorithm of oriented square multiplied by 2
	return previousValue + 
			currentValue['X'] * (array[(index + 1) % array.length]['Y']) - 
			currentValue['Y'] * (array[(index + 1) % array.length]['X']);
	}

	function createPath (obj, index) {
		path = document.createElementNS('http://www.w3.org/2000/svg',"path");
		startObj = obj.shift();
		svgData = 'M'+ startObj['X'] + ',' + startObj['Y'];
		createPathExpr(obj);
		path.setAttributeNS(null, 'd', svgData);
		path.setAttributeNS(null, 'style', 'fill:none; stroke:black; stroke-width:1;');
		paths.push(path)
		$('svg').append(path)
	}
	function createPathExpr (arr) {
		switch (arr.length)
		{
			case 1:
				// 1 point case: plot Q with start
				svgData += '\nQ' + arr[0]['X'] + ',' + arr[0]['Y'] + ' ' + 
					startObj['X'] + ',' + startObj['Y'];
				return;
				break;
			case 2: 
				// 2 points case: plot C with start
				svgData += '\nC' + arr[0]['X'] + ',' + arr[0]['Y'] + ' ' + 
					arr[1]['X'] + ',' + arr[1]['Y'] + ' ' +
					startObj['X'] + ',' + startObj['Y'];
				return;
				break;
			case 3: 
				// 3 points case: plot two Q
				svgData += '\nQ' + arr[0]['X'] + ',' + arr[0]['Y'] + ' ' + 
					arr[1]['X'] + ',' + arr[1]['Y'] + ' ';
				arr.shift();
				arr.shift();
				createPathExpr(arr);
				return;
				break;
		}
		if (arr.length > 3) {
			// plot C with 3 dots
			svgData += '\nC';
			for (var i = 0; i< 3; i++) {
				svgData += arr[0]['X'] + ',' + arr[0]['Y'] + ' ';
				arr.shift();
			}
			createPathExpr(arr)
		} else {
			// array is empty
			return;
		}								
	}

	var $link, App, app, main, self, curArr, startObj, path
		paths = [],
		arrayLen = 0, 
		svgData = '';
	return function() {
		main = $('#main');
		App = function ContainerViewModel () {
			self = this;
			self.orientations = ko.observableArray();
			// obtain orientation json
			$.ajax({
				url: 'data/orientation.json',
				dataType: 'json',
				success: function (res) {
					res.forEach(function (obj, index) {
						self.orientations.push(obj.reduce(reduceFn, 0));
					});
				}
			});

			// obtain bezier json 
			$.ajax({
				url: 'data/Bezier.json',
				dataType: 'json',
				success: function (res) {
					res.forEach(createPath);
				}
			});
			this.paths = ko.observableArray(paths);

			// this.htmlStructure = ko.observable($('#index').html());
			this.openPage = function (url) {
				highlight(url);
				main.animate({opacity: 0}, 200, function () {
					main.find('section').first().prependTo('body');
					main.append(template(url))
					main.animate({opacity: 1}, 200);
			});
				
			};


		};
		app = new App ();
		Sammy('#main', function() {
		  // define a 'route'
		  this.get('#orientation', function (url) {
		    app.openPage(url);

		  });
		  this.get('#bezier', function (url) {
		    app.openPage(url);

		  });		  		   
		  this.get('', function (url) {
		    app.openPage(url);

		  });
		}).run('#/');;

		
			
		ko.applyBindings(app);
	}
})();
$(onload);




