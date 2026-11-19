/**
 * E-Voting OSIS - Persentase Suara (persentase.html)
 */
import { request } from '../api.js';
import { guardAdmin } from '../auth.js';
import { renderDonutChart } from '../charts.js';
import { getCandidateColor } from '../config.js';
import { createPoller } from '../poller.js';
import { renderNavbarAdmin } from '../ui.js';

await guardAdmin();
renderNavbarAdmin('persentase');

const donutCanvas = document.getElementById('donut-chart');
const donutCenterTotal = document.getElementById('donut-center-total');
const breakdownContainer = document.getElementById('percentage-breakdown-container');

let donutInstance = null;

function updateUI(data) {
  donutCenterTotal.textContent = (data.total_votes || 0).toLocaleString('id-ID');

  if (donutCanvas) {
    donutInstance = renderDonutChart(donutCanvas.getContext('2d'), data.candidates, donutInstance);
  }

  breakdownContainer.innerHTML = (data.candidates || []).map(c => {
    const color = getCandidateColor(c.number);
    const isLeader = c.is_leader && data.total_votes > 0;

    return `
      <div class="bg-white border border-[#e4eadc] shadow-[0_5px_18px_rgba(36,55,26,0.06)] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${isLeader ? 'ring-2 ring-[#8dbb50] shadow-md' : ''}">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl font-black text-[#789f43]">0${c.number}</span>
            <div>
              <div class="font-black text-[#25351f] text-base leading-tight">${c.chairman_name} & ${c.vice_name}</div>
              <div class="text-xs text-[#788174] font-medium">${c.chairman_class} • ${c.vice_class}</div>
            </div>
          </div>

          <div class="text-right">
            <div class="text-2xl font-black text-[#789f43]">${c.percentage}%</div>
            <div class="text-xs text-[#788174] font-bold">${c.votes_count} suara</div>
          </div>
        </div>

        <div class="w-full h-3 bg-[#f0f4ec] rounded-full overflow-hidden border border-[#e4eadc] mt-4">
          <div
            class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#8dbb50] to-[#a9ce70]"
            style="width: ${c.percentage}%"
          ></div>
        </div>
      </div>
    `;
  }).join('');
}

const poller = createPoller({
  fn: async () => {
    const res = await request('/results');
    return res.data;
  },
  interval: 5000,
  onData: updateUI,
});

poller.start();
