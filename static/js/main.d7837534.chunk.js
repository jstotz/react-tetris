(this["webpackJsonpreact-tetris"]=this["webpackJsonpreact-tetris"]||[]).push([[0],{179:function(e,t,n){"use strict";n.r(t);var r=n(1),a=n(35),o=n(0),c=n.n(o),i=n(34),u=n.n(i),d=n(21),s=n.n(d),l=n(4),g=n(66),b=n(9),p=n(2),h=n(7),f=n(22),m=n(60),v=n(61),j=n(62),O=n.n(j),y=n(24),w=n.n(y);function x(e,t){var n=e.map((function(e){return e.map((function(e){return 0===e?{type:"empty"}:{type:"piece",shape:t}}))}));return{x:0,y:0,shape:t,grid:n,preview:!1}}var C=x([[0,1,0],[0,1,0],[1,1,0]],"J"),S=x([[0,1,0],[0,1,0],[0,1,1]],"L"),k=x([[0,0,0],[1,1,1],[0,1,0]],"T"),I=x([[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],"I"),P=x([[1,1],[1,1]],"O"),G=[C,k,S,I,x([[0,1,1],[1,1,0],[0,0,0]],"S"),x([[1,1,0],[0,1,1],[0,0,0]],"Z"),P];function B(e){return w()(e,(function(){return{type:"empty"}}))}function T(e,t){return w()(t,(function(){return B(e)}))}function N(e,t){return{width:e,height:t,grid:T(e,t)}}function M(e,t,n){var r=n.horizontally,a=void 0!==r&&r,o=n.vertically,c=void 0!==o&&o,i=a?Math.floor((t.width-e.grid[0].length)/2):e.x,u=c?Math.floor((t.height-e.grid.length)/2):e.x;return Object(p.a)(Object(p.a)({},e),{},{x:i,y:u})}function R(e){return"piece"===e.type}function E(e,t,n){return function(e,t,n){return e>=0&&e<n.width&&t>=0&&t<n.height}(e,t,n)&&!R(n.grid[t][e])}function L(e,t){for(var n=0;n<e.grid.length;n++)for(var r=0;r<e.grid[n].length;r++){var a=[r+e.x,n+e.y],o=a[0],c=a[1];if("empty"!==e.grid[n][r].type&&!E(o,c,t))return!1}return!0}function D(e,t){return Object(f.a)(t,(function(n){e.grid.forEach((function(r,a){r.forEach((function(r,o){if("empty"!==r.type){var c={type:e.preview?"preview":"piece",shape:e.shape},i=e.x+o,u=e.y+a;E(i,u,t)&&(n.grid[u][i]=c)}}))}))}))}function J(e,t){return D(function(e,t){var n=Object(p.a)(Object(p.a)({},e),{},{color:"#ddd",preview:!0});return F(n,t)}(e,t),D(e,t))}var F=function(e,t){for(;;){var n=Object(p.a)(Object(p.a)({},e),{},{y:e.y+1});if(!L(n,t))return e;e=n}},z=function(e){return Object(p.a)(Object(p.a)({},e),{},{y:e.y+1})};var A=n.p+"static/media/sprite.41007b57.mp3",Z={linesCleared:[0,281.31519274376416],tetris:[2e3,2681.3151927437643]},H=n(3),W={light:{textColor:H.gray[9],emptyColor:H.gray[1],previewColor:H.gray[3],backgroundColor:H.white,pieceColors:{J:H.pink[7],T:H.grape[7],L:H.violet[7],I:H.blue[7],S:H.orange[7],Z:H.lime[7],O:H.red[7]}},dark:{textColor:H.gray[0],emptyColor:H.gray[8],previewColor:H.gray[7],backgroundColor:H.gray[9],pieceColors:{J:H.pink[1],T:H.grape[1],L:H.violet[1],I:H.blue[1],S:H.orange[1],Z:H.lime[1],O:H.yellow[1]}}};function q(e,t){var n=Object(o.useState)((function(){var n=window.localStorage.getItem(e);return null===n?t:JSON.parse(n)})),r=Object(l.a)(n,2),a=r[0],c=r[1];return[a,function(n){null===n?window.localStorage.removeItem(e):window.localStorage.setItem(e,JSON.stringify(n)),c(n||t)}]}function U(e){return M(Object(p.a)({},G[O()(0,G.length-1)]),e,{horizontally:!0})}function X(e,t,n){var r=e.game;if($(e)){var a=z(r.piece);if(L(a,r.baseBoard))t.game.piece=a;else{var o=function(e){var t=e.grid.filter((function(e){return!e.every(R)})),n=e.height-t.length;return n>0&&(t=w()(e.height-t.length,(function(){return B(e.width)})).concat(t)),{board:Object(p.a)(Object(p.a)({},e),{},{grid:t}),completedRowCount:n}}(D(r.piece,r.baseBoard)),c=o.board,i=o.completedRowCount;t.game.baseBoard=c,4===i?n({type:"playSound",soundId:"tetris"}):i>0&&n({type:"playSound",soundId:"linesCleared"}),t.game.score+=function(e){switch(e){case 0:return 0;case 1:return 40;case 2:return 100;case 3:return 300;case 4:return 1200;default:throw new Error("unexpected completed row count ".concat(e))}}(i),t.game.piece=r.nextPiece,t.game.nextPiece=U(c),t.game.baseBoard=c,L(r.nextPiece,c)||(t.game.gameOver=!0)}}}var $=function(e){var t=e.game,n=e.settingsOpen;return!t.paused&&!t.gameOver&&!n};function K(e){var t=N(e.boardWidth,e.boardHeight);return{piece:U(t),nextPiece:U(t),gameOver:!1,paused:!1,baseBoard:t,score:0}}function Q(e){return{game:K(e),config:e,themeId:"light",settingsOpen:!1}}function V(e){var t=N(4,4);return D(M(e,t,{horizontally:!0,vertically:!0}),t)}function Y(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:_(),t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:Q(e);return Object(p.a)(Object(p.a)(Object(p.a)({},t),t.game),{},{theme:W[t.themeId],board:J(t.game.piece,t.game.baseBoard),nextPieceBoard:V(t.game.nextPiece)})}function _(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:10,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:20;return{boardWidth:e,boardHeight:t}}var ee={left:function(e){return Object(p.a)(Object(p.a)({},e),{},{x:e.x-1})},right:function(e){return Object(p.a)(Object(p.a)({},e),{},{x:e.x+1})},down:z,rotate:function(e){return Object(p.a)(Object(p.a)({},e),{},{grid:(t=e.grid,t.map((function(e,n){return e.map((function(e,r){return t[t.length-1-r][n]}))})))});var t},hardDrop:F},te=function(e,t,n){return Object(f.a)(e,(function(r){switch(t.type){case"tick":X(e,r,n);break;case"loadGame":r.game=t.game;break;case"restoreSavedGame":n({type:"restoreSavedGame"});break;case"reset":r.game=K(e.config);break;case"movePiece":!function(e,t,n){var r=e.game;if($(e)){var a=n(r.piece,r.baseBoard);L(a,r.baseBoard)&&(t.game.piece=a)}}(e,r,ee[t.move]),"hardDrop"===t.move&&X(r,r,n);break;case"togglePaused":r.game.paused=!e.game.paused;break;case"openSettings":r.settingsOpen=!0;break;case"closeSettings":r.settingsOpen=!1;break;case"saveGame":n({type:"saveGame",game:e.game});break;case"setTheme":r.themeId=t.themeId,n({type:"saveTheme",themeId:t.themeId});break;case"clearSavedGame":n({type:"saveGame",game:null}),r.game=K(e.config)}}))};function ne(){var e=_(),t=q("gameState",K(e)),n=Object(l.a)(t,2),r=n[0],a=n[1],c=q("theme","light"),i=Object(l.a)(c,2),u=i[0],d=i[1],s={playSound:function(e,t){var n=t.soundId;return y({id:n})},saveGame:function(e,t){var n=t.game;return a(n)},saveTheme:function(e,t){var n=t.themeId;return d(n)},restoreSavedGame:function(e,t,n){return n({type:"loadGame",game:r})}},g=Object(m.a)(te,Object(p.a)(Object(p.a)({},Q(e)),{},{game:r,themeId:u}),s),b=Object(l.a)(g,2),f=b[0],j=b[1],O=Object(v.a)(A,{soundEnabled:$(f),sprite:Z}),y=Object(l.a)(O,1)[0],w=function(e){return j({type:"movePiece",move:e})};return Object(h.a)(window,"up",(function(){return w("rotate")})),Object(h.a)(window,"down",(function(){return w("down")})),Object(h.a)(window,"left",(function(){return w("left")})),Object(h.a)(window,"right",(function(){return w("right")})),Object(h.a)(window,"space",(function(){return w("hardDrop")})),Object(h.a)(window,"p",(function(){return j({type:"togglePaused"})})),Object(h.a)(window,"s",(function(){return j({type:"saveGame"})})),Object(h.a)(window,"r",(function(){return j({type:"clearSavedGame"})})),function(e,t){var n=Object(o.useRef)();Object(o.useEffect)((function(){n.current=e}),[e]),Object(o.useEffect)((function(){var e=setInterval((function(){n.current()}),t);return function(){clearInterval(e)}}),[t])}((function(){return j({type:"tick"})}),800),[Y(e,f),j]}var re=Object(o.createContext)([Y(),function(){}]),ae=n(63),oe=n.n(ae),ce=n(65),ie=n(64);var ue=function(e){var t=e.board,n=function(e,t){var n,r=Object(ie.a)(),a=r.ref,o=r.width,c=r.height,i=c*(e/t);return i>o?(i=o,n=o*(t/e)):n=c,{ref:a,width:i,height:n}}(t.width,t.height),a=n.ref,c=n.width,i=n.height,u=Object(o.useContext)(re),d=Object(l.a)(u,2),s=d[0].theme,g=d[1],h=t.grid,f=Object(o.useMemo)((function(){return Object(b.stylesheet)(Object(p.a)({container:{width:"100%",height:"100%"},grid:{display:"grid",gap:"2px 2px",gridAutoRows:"1fr",gridTemplateColumns:"repeat(".concat(t.width,", 1fr)"),gridTemplateRows:"repeat(".concat(t.height,", 1fr)")},empty:{backgroundColor:s.emptyColor},preview:{backgroundColor:s.previewColor}},oe()(s.pieceColors,(function(e){return{backgroundColor:e}}))))}),[t.width,t.height,s.emptyColor,s.previewColor,s.pieceColors]),m=Object(o.useRef)(),v=Object(ce.useSwipeable)({onSwipedUp:function(){return g({type:"movePiece",move:"rotate"})},onTap:function(){return g({type:"movePiece",move:"rotate"})},onSwipedDown:function(){return g({type:"movePiece",move:"hardDrop"})},onSwiping:function(e){var n=e.dir,r=e.event;if("Right"===n||"Left"===n){var a=("touches"in r?r.touches[0]:r).clientX;void 0===m.current&&(m.current=a);var o=m.current-a,i=c/t.width/4,u=null;console.log(o,i),o>=i?u="left":o<=-i&&(u="right"),null!==u&&(m.current=a,g({type:"movePiece",move:u}))}}});return Object(r.jsx)("div",{ref:a,className:f.container,children:Object(r.jsx)("div",Object(p.a)(Object(p.a)({className:f.container},v),{},{children:Object(r.jsx)("div",{className:f.grid,style:{width:c,height:i},children:h.flatMap((function(e,t){return e.flatMap((function(e,n){return Object(r.jsx)("div",{className:"piece"===e.type?f[e.shape]:f[e.type]},"".concat(n,",").concat(t))}))}))})}))})};function de(){var e=Object(o.useContext)(re),t=Object(l.a)(e,2),n=t[0].theme,a=t[1],c=n===W.dark?"light":"dark";return Object(r.jsxs)(r.Fragment,{children:[Object(r.jsx)("button",{onClick:function(){a({type:"setTheme",themeId:c}),a({type:"closeSettings"})},children:"dark"===c?"Dark Mode":"Light Mode"}),Object(r.jsx)("button",{onClick:function(){a({type:"saveGame"}),a({type:"closeSettings"})},children:"Save Game"}),Object(r.jsx)("button",{onClick:function(){a({type:"restoreSavedGame"}),a({type:"closeSettings"})},children:"Restore Saved Game"}),Object(r.jsx)("button",{onClick:function(){a({type:"clearSavedGame"}),a({type:"closeSettings"})},children:"Clear Saved Game"})]})}var se=function(){var e=ne(),t=Object(l.a)(e,2),n=t[0],a=t[1],c=n.gameOver,i=n.paused,u=n.board,d=n.score,p=n.settingsOpen,h=n.theme,f=Object(o.useMemo)((function(){return Object(b.stylesheet)({container:{backgroundColor:h.backgroundColor,color:h.textColor,width:"100%",height:"100%",touchAction:"none",$nest:{"@media screen and (hover: none)":{"-webkit-touch-callout":"none","-webkit-user-select":"none"}}},topBar:{height:"10%",padding:"1em"},boardContainer:{height:"90%",padding:"1em"}})}),[h]);return Object(r.jsx)(re.Provider,{value:[n,a],children:Object(r.jsxs)("div",{className:f.container,children:[Object(r.jsxs)("div",{className:f.topBar,children:[Object(r.jsxs)("div",{children:[i?"Paused":"Press P to pause",Object(r.jsx)("button",{onClick:function(){return a({type:"openSettings"})},children:"Settings"})]}),Object(r.jsxs)("div",{children:[Object(r.jsx)("strong",{children:"Score:"})," ",d]}),Object(r.jsx)(s.a,{isOpen:p,contentLabel:"Settings",onRequestClose:function(){return a({type:"closeSettings"})},style:{content:{backgroundColor:h.backgroundColor},overlay:{backgroundColor:Object(g.a)(h.backgroundColor).fadeOut("10%").toString()}},children:Object(r.jsx)(de,{})}),Object(r.jsx)("div",{children:c?Object(r.jsxs)(r.Fragment,{children:["Game Over"," ",Object(r.jsx)("button",{onClick:function(){return a({type:"reset"})},children:"New Game"})]}):""})]}),Object(r.jsx)("div",{className:f.boardContainer,children:Object(r.jsx)(ue,{board:u})})]})})},le=function(e){e&&e instanceof Function&&n.e(4).then(n.bind(null,181)).then((function(t){var n=t.getCLS,r=t.getFID,a=t.getFCP,o=t.getLCP,c=t.getTTFB;n(e),r(e),a(e),o(e),c(e)}))};s.a.setAppElement("#root"),Object(a.normalize)(),Object(a.setupPage)("#root"),u.a.render(Object(r.jsx)(c.a.StrictMode,{children:Object(r.jsx)(se,{})}),document.getElementById("root")),le()}},[[179,1,2]]]);
//# sourceMappingURL=main.d7837534.chunk.js.map