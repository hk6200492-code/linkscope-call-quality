const features = [
  ['Upload speed','Mbps',0.2,12,0.1], ['Round-trip latency','ms',10,350,1],
  ['Jitter','ms',0,100,1], ['Packet loss','%',0,8,0.1]
];
const samples = [[8,40,8,0.3],[4,180,45,3],[0.7,290,85,7]];
const labels = ['Smooth','Uneven','Poor'];
const notes = ['The model expects clear, responsive video.','The model expects occasional delays or interruptions.','The model expects frequent disruption during the call.'];
const byId = id => document.getElementById(id);
const sliders = features.map(([name,unit,min,max,step], i) => {
  const row = document.createElement('div');
  row.innerHTML = '<label for="f'+i+'">'+name+'<output id="v'+i+'"></output></label><input id="f'+i+'" type="range">';
  byId('controls').append(row);
  const slider = byId('f'+i);
  Object.assign(slider,{min,max,step});
  slider.oninput = () => { byId('scenario').selectedIndex=3; render(); };
  return slider;
});
function predict(values) {
  const scores = [0,0,0];
  for (const tree of model.trees) {
    let node = 0;
    while (tree.left[node] !== -1) {
      node = values[tree.feature[node]] <= tree.threshold[node] ? tree.left[node] : tree.right[node];
    }
    const votes = tree.votes[node];
    const total = votes.reduce((a,b)=>a+b,0);
    votes.forEach((v,i)=>scores[i]+=v/total/model.trees.length);
  }
  return scores;
}
function render() {
  const values = sliders.map((s,i)=>{
    byId('v'+i).textContent=s.value+' '+features[i][1];return Number(s.value);
  });
  const scores=predict(values);
  const best=scores.indexOf(Math.max(...scores));
  byId('quality').textContent=labels[best];
  byId('summary').textContent=notes[best];
  byId('scores').innerHTML=scores.map((s,i)=>{
    const pct=Math.round(s*100);
    return '<div class="score"><span>'+labels[i]+'</span><div class="track"><div class="fill" style="width:'+pct+'%"></div></div><b>'+pct+'%</b></div>';
  }).join('');
}
function preset() {
  samples[byId('scenario').selectedIndex].forEach((v,i)=>sliders[i].value=v);
  render();
}
byId('scenario').onchange=preset;
byId('evaluation').textContent='On 1,000 held-out simulated calls, accuracy was '+(100*model.accuracy).toFixed(1)+'%. Always predicting the most frequent class scored '+(100*model.baseline).toFixed(1)+'%.';
preset();
