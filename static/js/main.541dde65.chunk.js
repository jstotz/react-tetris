(this["webpackJsonpreact-tetris"]=this["webpackJsonpreact-tetris"]||[]).push([[0],{51:function(e,t,r){"use strict";r.r(t);var n=r(1),a=r(15),o=r(0),c=r.n(o),i=r(14),u=r.n(i),d=r(9),s=r.n(d),g=r(4),l=r(25),b=r(7),p=r(2),h=r(6),m=r(10),f=r(22),j=r(23),O=r(8);function v(e,t){var r=e.map((function(e){return e.map((function(e){return 0===e?{type:"empty"}:{type:"piece",shape:t}}))}));return{x:0,y:0,shape:t,grid:r,preview:!1}}var y=v([[0,1,0],[0,1,0],[1,1,0]],"J"),w=v([[0,1,0],[0,1,0],[0,1,1]],"L"),C=v([[0,0,0],[1,1,1],[0,1,0]],"T"),x=v([[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],"I"),k=v([[1,1],[1,1]],"O"),S=[y,C,w,x,v([[0,1,1],[1,1,0],[0,0,0]],"S"),v([[1,1,0],[0,1,1],[0,0,0]],"Z"),k];function I(e){return Object(O.times)(e,(function(){return{type:"empty"}}))}function G(e,t){return Object(O.times)(t,(function(){return I(e)}))}function P(e){return function(e,t){var r=Math.floor((t-e.grid[0].length)/2);return Object(p.a)(Object(p.a)({},e),{},{x:r})}(Object(p.a)({},S[Object(O.random)(0,S.length-1)]),e)}function B(e){return"piece"===e.type}function T(e,t,r){return function(e,t,r){return e>=0&&e<r.width&&t>=0&&t<r.height}(e,t,r)&&!B(r.grid[t][e])}function N(e,t){for(var r=0;r<e.grid.length;r++)for(var n=0;n<e.grid[r].length;n++){var a=[n+e.x,r+e.y],o=a[0],c=a[1];if("empty"!==e.grid[r][n].type&&!T(o,c,t))return!1}return!0}function E(e,t){return Object(m.a)(t,(function(r){e.grid.forEach((function(n,a){n.forEach((function(n,o){if("empty"!==n.type){var c={type:e.preview?"preview":"piece",shape:e.shape},i=e.x+o,u=e.y+a;T(i,u,t)&&(r.grid[u][i]=c)}}))}))}))}function M(e,t){return E(function(e,t){var r=Object(p.a)(Object(p.a)({},e),{},{color:"#ddd",preview:!0});return J(r,t)}(e,t),E(e,t))}var J=function(e,t){for(;;){var r=Object(p.a)(Object(p.a)({},e),{},{y:e.y+1});if(!N(r,t))return e;e=r}},L=function(e){return Object(p.a)(Object(p.a)({},e),{},{y:e.y+1})};var R=r.p+"static/media/sprite.41007b57.mp3",F={linesCleared:[0,281.31519274376416],tetris:[2e3,2681.3151927437643]},D=r(3),W={light:{textColor:D.gray[9],emptyColor:D.gray[1],previewColor:D.gray[3],backgroundColor:D.white,pieceColors:{J:D.pink[7],T:D.grape[7],L:D.violet[7],I:D.blue[7],S:D.orange[7],Z:D.lime[7],O:D.red[7]}},dark:{textColor:D.gray[0],emptyColor:D.gray[8],previewColor:D.gray[7],backgroundColor:D.gray[9],pieceColors:{J:D.pink[1],T:D.grape[1],L:D.violet[1],I:D.blue[1],S:D.orange[1],Z:D.lime[1],O:D.yellow[1]}}};function Z(e,t){var r=Object(o.useState)((function(){var r=window.localStorage.getItem(e);return null===r?t:JSON.parse(r)})),n=Object(g.a)(r,2),a=n[0],c=n[1];return[a,function(r){null===r?window.localStorage.removeItem(e):window.localStorage.setItem(e,JSON.stringify(r)),c(r||t)}]}function A(e,t,r){var n=e.game;if(H(e)){var a=L(n.piece);if(N(a,n.baseBoard))t.game.piece=a;else{var o=function(e){var t=e.grid.filter((function(e){return!e.every(B)})),r=e.height-t.length;return r>0&&(t=Object(O.times)(e.height-t.length,(function(){return I(e.width)})).concat(t)),{board:Object(p.a)(Object(p.a)({},e),{},{grid:t}),completedRowCount:r}}(E(n.piece,n.baseBoard)),c=o.board,i=o.completedRowCount;t.game.baseBoard=c,4===i?r({type:"playSound",soundId:"tetris"}):i>0&&r({type:"playSound",soundId:"linesCleared"}),t.game.score+=function(e){switch(e){case 0:return 0;case 1:return 40;case 2:return 100;case 3:return 300;case 4:return 1200;default:throw new Error("unexpected completed row count ".concat(e))}}(i),t.game.piece=n.nextPiece,t.game.nextPiece=P(c.width),t.game.baseBoard=c,N(n.nextPiece,c)||(t.game.gameOver=!0)}}}var H=function(e){var t=e.game,r=e.settingsOpen;return!t.paused&&!t.gameOver&&!r};function q(e){return{piece:P(e.boardWidth),nextPiece:P(e.boardWidth),gameOver:!1,paused:!1,baseBoard:(t=e.boardWidth,r=e.boardHeight,{width:t,height:r,grid:G(t,r)}),score:0};var t,r}function z(e){return{game:q(e),config:e,themeId:"light",settingsOpen:!1}}function V(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:K(),t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:z(e);return Object(p.a)(Object(p.a)(Object(p.a)({},t),t.game),{},{theme:W[t.themeId],board:M(t.game.piece,t.game.baseBoard)})}function K(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:10,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:20;return{boardWidth:e,boardHeight:t}}var Q={left:function(e){return Object(p.a)(Object(p.a)({},e),{},{x:e.x-1})},right:function(e){return Object(p.a)(Object(p.a)({},e),{},{x:e.x+1})},down:L,rotate:function(e){return Object(p.a)(Object(p.a)({},e),{},{grid:(t=e.grid,t.map((function(e,r){return e.map((function(e,n){return t[t.length-1-n][r]}))})))});var t},hardDrop:J},U=function(e,t,r){return Object(m.a)(e,(function(n){switch(t.type){case"tick":A(e,n,r);break;case"loadGame":n.game=t.game;break;case"restoreSavedGame":r({type:"restoreSavedGame"});break;case"reset":n.game=q(e.config);break;case"movePiece":!function(e,t,r){var n=e.game;if(H(e)){var a=r(n.piece,n.baseBoard);N(a,n.baseBoard)&&(t.game.piece=a)}}(e,n,Q[t.move]),"hardDrop"===t.move&&A(n,n,r);break;case"togglePaused":n.game.paused=!e.game.paused;break;case"openSettings":n.settingsOpen=!0;break;case"closeSettings":n.settingsOpen=!1;break;case"saveGame":r({type:"saveGame",game:e.game});break;case"setTheme":n.themeId=t.themeId,r({type:"saveTheme",themeId:t.themeId});break;case"clearSavedGame":r({type:"saveGame",game:null}),n.game=q(e.config)}}))};function X(){var e=K(),t=Z("gameState",q(e)),r=Object(g.a)(t,2),n=r[0],a=r[1],c=Z("theme","light"),i=Object(g.a)(c,2),u=i[0],d=i[1],s={playSound:function(e,t){var r=t.soundId;return y({id:r})},saveGame:function(e,t){var r=t.game;return a(r)},saveTheme:function(e,t){var r=t.themeId;return d(r)},restoreSavedGame:function(e,t,r){return r({type:"loadGame",game:n})}},l=Object(f.a)(U,Object(p.a)(Object(p.a)({},z(e)),{},{game:n,themeId:u}),s),b=Object(g.a)(l,2),m=b[0],O=b[1],v=Object(j.a)(R,{soundEnabled:H(m),sprite:F}),y=Object(g.a)(v,1)[0],w=function(e){return O({type:"movePiece",move:e})};return Object(h.a)(window,"up",(function(){return w("rotate")})),Object(h.a)(window,"down",(function(){return w("down")})),Object(h.a)(window,"left",(function(){return w("left")})),Object(h.a)(window,"right",(function(){return w("right")})),Object(h.a)(window,"space",(function(){return w("hardDrop")})),Object(h.a)(window,"p",(function(){return O({type:"togglePaused"})})),Object(h.a)(window,"s",(function(){return O({type:"saveGame"})})),Object(h.a)(window,"r",(function(){return O({type:"clearSavedGame"})})),function(e,t){var r=Object(o.useRef)();Object(o.useEffect)((function(){r.current=e}),[e]),Object(o.useEffect)((function(){var e=setInterval((function(){r.current()}),t);return function(){clearInterval(e)}}),[t])}((function(){return O({type:"tick"})}),800),[V(e,m),O]}var Y=Object(o.createContext)([V(),function(){}]),$=r(24);var _=function(e){var t=e.board,r=function(e,t){var r,n=Object($.a)(),a=n.ref,o=n.width,c=n.height,i=c*(e/t);return i>o?(i=o,r=o*(t/e)):r=c,{ref:a,width:i,height:r}}(t.width,t.height),a=r.ref,c=r.width,i=r.height,u=Object(o.useContext)(Y),d=Object(g.a)(u,1)[0].theme,s=t.grid,l=Object(o.useMemo)((function(){return Object(b.stylesheet)(Object(p.a)({container:{width:"100%",height:"100%"},grid:{display:"grid",gap:"2px 2px",gridAutoRows:"1fr",gridTemplateColumns:"repeat(".concat(t.width,", 1fr)"),gridTemplateRows:"repeat(".concat(t.height,", 1fr)")},empty:{backgroundColor:d.emptyColor},preview:{backgroundColor:d.previewColor}},Object(O.mapValues)(d.pieceColors,(function(e){return{backgroundColor:e}}))))}),[t.width,t.height,d.emptyColor,d.previewColor,d.pieceColors]);return Object(n.jsx)("div",{ref:a,className:l.container,children:Object(n.jsx)("div",{className:l.grid,style:{width:c,height:i},children:s.flatMap((function(e,t){return e.flatMap((function(e,r){return Object(n.jsx)("div",{className:"piece"===e.type?l[e.shape]:l[e.type]},"".concat(r,",").concat(t))}))}))})})};function ee(){var e=Object(o.useContext)(Y),t=Object(g.a)(e,2),r=t[0].theme,a=t[1],c=r===W.dark?"light":"dark";return Object(n.jsxs)(n.Fragment,{children:[Object(n.jsx)("button",{onClick:function(){a({type:"setTheme",themeId:c}),a({type:"closeSettings"})},children:"dark"===c?"Dark Mode":"Light Mode"}),Object(n.jsx)("button",{onClick:function(){a({type:"saveGame"}),a({type:"closeSettings"})},children:"Save Game"}),Object(n.jsx)("button",{onClick:function(){a({type:"restoreSavedGame"}),a({type:"closeSettings"})},children:"Restore Saved Game"}),Object(n.jsx)("button",{onClick:function(){a({type:"clearSavedGame"}),a({type:"closeSettings"})},children:"Clear Saved Game"})]})}var te=function(){var e=X(),t=Object(g.a)(e,2),r=t[0],a=t[1],c=r.gameOver,i=r.paused,u=r.board,d=r.score,p=r.settingsOpen,h=r.theme,m=Object(o.useMemo)((function(){return Object(b.stylesheet)({container:{backgroundColor:h.backgroundColor,color:h.textColor,width:"100%",height:"100%"},topBar:{height:"10%",padding:"1em"},boardContainer:{height:"90%",padding:"1em"}})}),[h]);return Object(n.jsx)(Y.Provider,{value:[r,a],children:Object(n.jsxs)("div",{className:m.container,children:[Object(n.jsxs)("div",{className:m.topBar,children:[Object(n.jsxs)("div",{children:[i?"Paused":"Press P to pause",Object(n.jsx)("button",{onClick:function(){return a({type:"openSettings"})},children:"Settings"})]}),Object(n.jsxs)("div",{children:[Object(n.jsx)("strong",{children:"Score:"})," ",d]}),Object(n.jsx)(s.a,{isOpen:p,contentLabel:"Settings",onRequestClose:function(){return a({type:"closeSettings"})},style:{content:{backgroundColor:h.backgroundColor},overlay:{backgroundColor:Object(l.a)(h.backgroundColor).fadeOut("10%").toString()}},children:Object(n.jsx)(ee,{})}),Object(n.jsx)("div",{children:c?Object(n.jsxs)(n.Fragment,{children:["Game Over"," ",Object(n.jsx)("button",{onClick:function(){return a({type:"reset"})},children:"New Game"})]}):""})]}),Object(n.jsx)("div",{className:m.boardContainer,children:Object(n.jsx)(_,{board:u})})]})})},re=function(e){e&&e instanceof Function&&r.e(4).then(r.bind(null,53)).then((function(t){var r=t.getCLS,n=t.getFID,a=t.getFCP,o=t.getLCP,c=t.getTTFB;r(e),n(e),a(e),o(e),c(e)}))};s.a.setAppElement("#root"),Object(a.normalize)(),Object(a.setupPage)("#root"),u.a.render(Object(n.jsx)(c.a.StrictMode,{children:Object(n.jsx)(te,{})}),document.getElementById("root")),re()}},[[51,1,2]]]);
//# sourceMappingURL=main.541dde65.chunk.js.map