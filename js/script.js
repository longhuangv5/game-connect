(function(window, undefined) {
	'use strict'

	if(!Array.prototype.shuffle) {
		Array.prototype.shuffle = function() {
			for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
			return this;
		};
	}

	var blocks = {},
		sprites = [],
		types = {
			0: '-0px -50px',
			1: '-50px -50px',
			2: '-100px -50px',
			3: '-150px -50px',
			4: '-200px -50px',
			5: '-250px -50px',
			6: '-300px -50px',
			7: '-350px -50px',
			8: '-50px -0px',
			9: '-100px -0px',
			10: '-150px -0px',
			11: '-200px -0px',
			12: '-250px -0px',
			13: '-300px -0px',
			14: '-0px -0px',
			15: '-350px -0px',
		},
		curr,
		maxTemp,
		minTemp,
		callback,
		refresh = {
			refresh:function(cb){
				callback = cb;
			}
		},
		game = window.game = window.g = function() {
			return new game.prototype.init();
		}

	game.prototype = {
		init: function(size, number) {},

		start: function(size, number) {
			game.wh = size;
			game.number = number;
			var gameFrame = document.getElementById('game-frame');
			var frame = document.getElementById('blocks');
			gameFrame.removeChild(frame);
			frame = document.createElement('UL');
			frame.id = 'blocks';
			gameFrame.appendChild(frame);
			sprites = [];
			game.addBlock(frame, size, number);
			return refresh;
		},
		over: function(){
			for(var i in blocks){
				for(var j in blocks[i]){
					blocks[i][j].block.onclick = undefined;
					blocks[i][j].type < 10 && (blocks[i][j].block.style.backgroundColor = 'red');
				}
			}
		}
	}

	game.prototype.init.prototype = game.prototype;

	game.extend = game.prototype.extend = function() {
		var src, copy, options, copyIsArray,
			target = arguments[0] || {},
			len = arguments.length,
			i = 1,
			deep = false;
		if(typeof target === 'boolean') {
			deep = target;
			target = arguments[1] || {};
			i = 2;
		}

		if(typeof target !== 'object') {
			target = {};
		}

		if(len === i) {
			target = this;
			--i;
		}

		for(; i < len; i++) {
			if((options = arguments[i]) != null) {
				for(name in options) {
					src = target[name];
					copy = options[name];
					if(target === copy) {
						continue;
					}
					if(deep && copy && (typeof copy === 'object' || (copyIsArray = (typeof copy === 'array')))) {
						if(copyIsArray) {
							copyIsArray = false;
							clone = src && typeof src === 'array' ? src : [];
						} else {
							clone = src && typeof src === 'object' ? src : {};
						}
						target[name] = jQuery.extend(deep, clone, copy);
					} else if(copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}
		return target;
	}

	game.extend({
		bSize: 0,
		bNumber: 0,
		stop: false,
		line: {},
		data: { refresh: game.cb },
		addBlock: function(frame, size, number) {
			game.bSize = size;
			game.bNumber = number + 2;
			var spritesN = number * number / 2;
			while(spritesN--) {
				var x = Math.floor(Math.random() * 8);
				sprites.push(x);
				sprites.push(x);
			}
			sprites.shuffle();
			var rows = -1;
			while(rows++ < number + 1) {
				var cols = -1;
				while(cols++ < number + 1) {
					frame.appendChild(game.creatBlock(cols, rows));
				}
			}
		},

		creatBlock: function(r, c) {
			var li = document.createElement('LI'),
				x;
			if(r === 0 || r === game.bNumber - 1 || c === 0 || c === game.bNumber - 1) {
				x = 14;
			} else {
				x = sprites.pop();
			}
			li.style.width = li.style.height = game.bSize / game.bNumber + 'px';
			li.style.backgroundPosition = types[x]
			li.id = r + '-' + c;
			li.onclick = game.click;
			blocks[r] || (blocks[r] = {});
			blocks[r][c] = {
				block: li,
				type: x
			};
			return li;
		},

		click: function() {
			if(!curr) {
				curr = this.getAttribute('id');
				if(blocks[curr.split('-')[0]][curr.split('-')[1]].type > game.bNumber - 1) {
					curr = undefined;
					return false;
				}
				blocks[curr.split('-')[0]][curr.split('-')[1]]['block'].style.backgroundColor = 'red';
			} else {
				game.deal(curr, this.getAttribute('id'));
				blocks[curr.split('-')[0]][curr.split('-')[1]]['block'].style.backgroundColor = 'transparent';
				curr = undefined;
			}
		},

		deal: function(pre, curr) {
			var pres = pre.split('-'),
				currs = curr.split('-');
			game.loop(parseInt(pres[0]), parseInt(currs[0]), parseInt(pres[1]), parseInt(currs[1]));
		},

		loop: function(x1, x2, y1, y2) {
			if(blocks[x1][y1].type !== blocks[x2][y2].type) return false;
			game.stop = false;
			game.loopWhile(x1, x2, function(x) {
				game.loopX(x1, x2, x, y1, y2);
			});
			if(game.stop) return;
			game.loopWhile(y1, y2, function(y) {
				game.loopY(x1, x2, y, y1, y2);
			});
		},

		loopX: function(x1, x2, x, y1, y2) {
			game.line = {};
			if(y1 === y2) {
				return false;
			} else {
				if(game.subLoopX(x1, x2, x, y1, y2, x1, y1, x2, y2)) {
					if(x1 === x && x2 === x) {
						game.removeBlock(x1, y1, x2, y2);
					} else if(x1 === x && x2 !== x) {
						if(game.subLoopY(x1, x2, y2, y2, y2)) {
							game.removeBlock(x1, y1, x2, y2);
						}
					} else if(x1 !== x && x2 === x) {
						if(game.subLoopY(x1, x2, y1, y1, y1)) {
							game.removeBlock(x1, y1, x2, y2);
						}
					} else {
						if(game.subLoopY(x1, x, y1, y1, y1) && game.subLoopY(x, x2, y2, y2, y2)) {
							game.removeBlock(x1, y1, x2, y2);
						}
					}
				};
			}
		},

		loopY: function(x1, x2, y, y1, y2) {
			game.line = {};
			if(x1 === x2) {
				return false;
			} else {
				if(game.subLoopY(x1, x2, y, y1, y2)) {
					if(y1 === y && y2 === y) {
						game.removeBlock(x1, y1, x2, y2);
					} else if(y1 === y && y2 !== y) {
						if(game.subLoopX(x2, x2, x2, y1, y2, x1, y1, x2, y2)) {
							game.removeBlock(x1, y1, x2, y2);
						}
					} else if(y1 !== y && y2 === y) {
						if(game.subLoopX(x1, x1, x1, y1, y2, x1, y1, x2, y2)) {
							game.removeBlock(x1, y1, x2, y2);
						}
					} else {
						if(game.subLoopX(x1, x1, x1, y1, y, x1, y1, x2, y2) && game.subLoopX(x2, x2, x2, y, y2, x1, y1, x2, y2)) {
							game.removeBlock(x1, y1, x2, y2);
						}
					}
				};
			}
		},

		subLoopX: function(x1, x2, x, y1, y2, x3, y3, x4, y4) {
			if(y1 > y2) {
				maxTemp = {
					x: x1,
					y: y1
				};
				minTemp = {
					x: x2,
					y: y2
				}
			} else {
				maxTemp = {
					x: x2,
					y: y2
				};
				minTemp = {
					x: x1,
					y: y1
				}
			}
			game.line[x] || (game.line[x] = {});
			for(var i = minTemp.y; i <= maxTemp.y; i++) {
				if((x === x3 && i === y3) || (x === x4 && i === y4)) continue;
				if(blocks[x][i].type !== 14) return false;
				if(i === minTemp.y) {
					if(minTemp.x > x) {
						game.line[x][i] = 11;
					} else if(minTemp.x < x) {
						game.line[x][i] = 12;
					} else {
						if(i === y3 || x === x4) {
							x > x3 ? (game.line[x][i] = 12) : (game.line[x][i] = 11);
						} else if(i === y4 || x === x3) {
							x > x4 ? (game.line[x][i] = 12) : (game.line[x][i] = 11);
						}
					}
				} else if(i === maxTemp.y) {
					if(maxTemp.x > x) {
						game.line[x][i] = 10;
					} else if(maxTemp.x < x) {
						game.line[x][i] = 13;
					} else {
						if(i === y3 || x === x4) {
							x > x3 ? (game.line[x][i] = 13) : (game.line[x][i] = 10);
						} else if(i === y4 || x === x3) {
							x > x4 ? (game.line[x][i] = 13) : (game.line[x][i] = 10);
						}
					}
				} else {
					game.line[x][i] = 8;
				}
			}
			return true;
		},

		subLoopY: function(x1, x2, y, y1, y2) {
			if(x1 > x2) {
				maxTemp = {
					x: x1,
					y: y1
				};
				minTemp = {
					x: x2,
					y: y2
				}
			} else {
				maxTemp = {
					x: x2,
					y: y2
				};
				minTemp = {
					x: x1,
					y: y1
				}
			}
			if(y1 === y && y2 === y && (x1 - x2 === 1 || x1 - x2 === -1)) {
				return true;
			}
			for(var i = minTemp.x + 1; i < maxTemp.x; i++) {
				if(blocks[i][y].type !== 14) return false;
				game.line[i] || (game.line[i] = {});
				game.line[i][y] = 9;
			}
			return true;
		},

		removeBlock: function(x1, y1, x2, y2) {
			game.stop = true;
			blocks[x1][y1].block.style.backgroundPosition = types[15];
			blocks[x1][y1].type = 14;
			blocks[x2][y2].block.style.backgroundPosition = types[15];
			blocks[x2][y2].type = 14;
			callback();
			for(var i in game.line) {
				for(var j in game.line[i]) {
					blocks[i][j].block.style.backgroundPosition = types[game.line[i][j]];
				}
			}
			setTimeout(function() {
				blocks[x1][y1].block.style.backgroundPosition = types[14];
				blocks[x2][y2].block.style.backgroundPosition = types[14];
				for(var i in game.line) {
					for(var j in game.line[i]) {
						blocks[i][j].block.style.backgroundPosition = types[14];
					}
				}
			}, 500)
		},

		addLine: function(x, y, t) {
			game.line[x] || (game.line[x] = {});
			game.line[x][y] = t;
		},

		loopWhile: function(n1, n2, callback) {
			var i = -1,
				n = Math.floor((n1 + n2) / 2),
				temp, flag = 0;
			while(i++ < game.bNumber - 1) {
				if(game.stop) break;
				temp = n;
				if(flag) {
					n = n + flag;
				} else {
					n = n + i * Math.pow(-1, i);
				}
				if(n > game.bNumber - 1) {
					flag = -1;
					n = temp - 1;
				} else if(n < 0) {
					flag = 1;
					n = temp + 1;
				}
				callback(n);
			}
		}
	});

})(window)