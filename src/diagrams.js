const svg=(label,body)=>`<svg role="img" aria-label="${label}" viewBox="0 0 360 190" class="diagram">${body}</svg>`;
export function diagram(n){
 if(n===5)return svg('සමාන කොටු හතරක් සහිත සමචතුරස්‍රය','<path d="M100 15h160v160H100z M180 15v160 M100 95h160"/>');
 if(n===9)return svg('සෘජුකෝණී ත්‍රිකෝණය. පාද 6 සහ 8 සෙ.මී.','<path d="M90 20v140h190z M90 140h20v20"/><text x="42" y="95">6 cm</text><text x="170" y="185">8 cm</text>');
 if(n===12)return svg('වසා ඇති ලේබල් සහිත පෙට්ටි තුනක්',['රතු පමණයි','නිල් පමණයි','මිශ්‍ර'].map((t,i)=>`<rect x="${8+i*119}" y="45" width="106" height="100" rx="8"/><path d="M${8+i*119} 68h106"/><text x="${61+i*119}" y="108" text-anchor="middle" style="font-size:12px">${t}</text>`).join(''));
 if(n===15)return svg('තීරු 3 පේළි 2 ජාලය. A පහළ වමේ, B ඉහළ දකුණේ.',`<path d="${[0,1,2,3].map(i=>`M${60+i*80} 20v140`).join(' ')} ${[0,1,2].map(i=>`M60 ${20+i*70}h240`).join(' ')}"/><text x="32" y="178">A</text><text x="310" y="25">B</text>`);
 return '';
}
