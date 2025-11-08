// app.js - متحكم الوظائف العامة (RTL Arabic)
// رقم الواتساب للاتصال (بدون صفر محلي) استخدم 966500772878
const WA_NUMBER = "966500772878";
const CAPITAL = 1500000; // ﷼1,500,000 رأس المال
const RISK_FUND = 200000; // ﷼200,000 صندوق مخاطر

// تنسيقات
function formatSAR(n){
  if(isNaN(n)) return "﷼0";
  return "﷼" + Number(n).toLocaleString('ar-EG', {maximumFractionDigits:0});
}
function formatNum(n){
  return Number(n).toLocaleString('ar-EG', {maximumFractionDigits:0});
}

// ====== Booking / extend functions ======
function sendWhatsAppMessage(message){
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WA_NUMBER}?text=${encoded}`;
  window.open(url,'_blank');
}

// Booking page: حساب التكلفة
function calcBookingTotal(){
  const daily = Number(document.getElementById('book_daily').value)||0;
  const days = Number(document.getElementById('book_days').value)||1;
  const extraDriver = document.getElementById('book_driver').checked ? Number(document.getElementById('book_driver_fee').value||0) : 0;
  const gps = document.getElementById('book_gps').checked ? Number(document.getElementById('book_gps_fee').value||0) : 0;
  const delivery = Number(document.getElementById('book_delivery_fee').value)||0;
  const subtotal = (daily * days) + extraDriver + gps + delivery;
  document.getElementById('book_subtotal').innerText = formatSAR(subtotal);
  return subtotal;
}

function submitBooking(){
  const name = document.getElementById('book_name').value||'—';
  const phone = document.getElementById('book_phone').value||'—';
  const car = document.getElementById('book_car').value||'—';
  const days = document.getElementById('book_days').value||1;
  const pay = document.querySelector('input[name="pay_method"]:checked')?.value || 'كاش';
  const subtotal = calcBookingTotal();
  const msg = `طلب حجز\nالاسم: ${name}\nالجوال: ${phone}\nالسيارة: ${car}\nالمدة (أيام): ${days}\nطريقة الدفع: ${pay}\nالمبلغ: ${formatSAR(subtotal)}\nالرجاء التواصل لإتمام الحجز.`;
  sendWhatsAppMessage(msg);
}

// Extend page
function calcExtend(){
  const days = Number(document.getElementById('extend_days').value)||1;
  const daily = Number(document.getElementById('extend_daily').value)||0;
  const subtotal = days * daily;
  const method = document.querySelector('input[name="extend_pay_method"]:checked')?.value || 'كاش';
  document.getElementById('extend_subtotal').innerText = formatSAR(subtotal);
  return subtotal;
}
function submitExtend(){
  const id = document.getElementById('extend_id').value||'—';
  const days = document.getElementById('extend_days').value||1;
  const subtotal = calcExtend();
  const pay = document.querySelector('input[name="extend_pay_method"]:checked')?.value || 'كاش';
  const msg = `طلب تمديد حجز\nرقم الحجز: ${id}\nأيام إضافية: ${days}\nالمبلغ: ${formatSAR(subtotal)}\nطريقة الدفع: ${pay}`;
  sendWhatsAppMessage(msg);
}

// ===== Profit / Investor page =====
// نموذج آلي لحساب الأرباح بناءً على المدخلات التفصيلية
function calcInvestor(){
  // مدخلات
  const investType = document.querySelector('input[name="inv_type"]:checked')?.value || 'amount';
  let invested = 0;
  if(investType === 'amount'){
    invested = Number(document.getElementById('inv_amount').value) || 0;
  } else {
    const shares = Number(document.getElementById('inv_shares').value) || 0;
    const totalShares = Number(document.getElementById('inv_total_shares').value) || 1500;
    invested = (CAPITAL / totalShares) * shares;
  }
  // Assumptions / افتراضات تشغيلية
  const fleetCount = Number(document.getElementById('inv_fleet_count').value) || 15;
  const avgDaily = Number(document.getElementById('inv_avg_daily').value) || 200;
  const avgDaysPerMonth = Number(document.getElementById('inv_avg_days').value) || 20;
  const opExpenseRate = Number(document.getElementById('inv_expense_rate').value) || 0.70; // 70%
  // compute annual revenue based on assumed occupancy percent field (input)
  const occupancy = Number(document.getElementById('inv_occupancy').value) || 0.30;
  const annualRevenue = fleetCount * avgDaily * avgDaysPerMonth * 12 * occupancy;
  const operatingExpenses = annualRevenue * opExpenseRate;
  const netProfit = annualRevenue - operatingExpenses;
  // distribution
  const managementShare = netProfit * 0.20;
  const devShare = netProfit * 0.30;
  const partnersShare = netProfit * 0.50;
  // investor share proportion
  const investorShareRatio = invested / CAPITAL; // نسبة المساهمة من رأس المال
  const investorAnnualGain = partnersShare * investorShareRatio;
  // lock-in
  const lockMonths = Number(document.getElementById('inv_lock_months').value) || 15;
  const canWithdrawYear1 = lockMonths > 12 ? false : true;
  // produce table for 7 years projection
  const years = [];
  let fleet = fleetCount;
  let currentCapital = CAPITAL;
  for(let y=1;y<=7;y++){
    // each year revenue grows modestly by growthRate
    const growth = Number(document.getElementById('inv_growth_rate').value) || 0.10; // 10% growth default
    const rev = annualRevenue * Math.pow(1+growth, y-1);
    const exp = rev * opExpenseRate;
    const profit = rev - exp;
    // after year2, reinvest devShare to buy more cars (assume avg car price)
    if(y>=2){
      const avgCarPrice = Number(document.getElementById('inv_avg_car_price').value) || 70000;
      const buyFromDev = devShare; // using devShare from that year's profit
      const newCars = Math.floor(buyFromDev / avgCarPrice);
      fleet += newCars;
    }
    years.push({year:y,revenue:rev,expenses:exp,profit:profit,fleet:fleet});
  }

  // render UI
  document.getElementById('res_annual_revenue').innerText = formatSAR(Math.round(annualRevenue));
  document.getElementById('res_operating_expenses').innerText = formatSAR(Math.round(operatingExpenses));
  document.getElementById('res_net_profit').innerText = formatSAR(Math.round(netProfit));
  document.getElementById('res_management').innerText = formatSAR(Math.round(managementShare));
  document.getElementById('res_development').innerText = formatSAR(Math.round(devShare));
  document.getElementById('res_partners').innerText = formatSAR(Math.round(partnersShare));
  document.getElementById('res_invested_value').innerText = formatSAR(Math.round(invested));
  document.getElementById('res_investor_gain').innerText = formatSAR(Math.round(investorAnnualGain));
  document.getElementById('projection_table').innerHTML = "";
  let html = `<table class="table"><thead><tr><th>السنة</th><th>الإيرادات</th><th>المصاريف</th><th>صافي الربح</th><th>حجم الأسطول</th></tr></thead><tbody>`;
  years.forEach(r=>{
    html += `<tr><td>${r.year}</td><td>${formatSAR(Math.round(r.revenue))}</td><td>${formatSAR(Math.round(r.expenses))}</td><td>${formatSAR(Math.round(r.profit))}</td><td>${r.fleet}</td></tr>`;
  });
  html += `</tbody></table>`;
  document.getElementById('projection_table').innerHTML = html;

  // scenario probability guidance (30/40/70 usage)
  // also create three scenarios for investor share
  const scenarios = [0.30,0.40,0.70].map(p=>{
    const rev = fleetCount * avgDaily * avgDaysPerMonth * 12 * p;
    const net = rev * (1 - opExpenseRate);
    const partners = net * 0.50;
    const invGain = partners * investorShareRatio;
    return {p,rev,net,partners,invGain};
  });
  let scHtml = `<div class="card"><h3>تحليل سيناريوهات إشغال</h3><table class="table"><thead><tr><th>نسبة التشغيل</th><th>إيراد سنوي</th><th>صافي الربح</th><th>حصة الشركاء</th><th>ربحك السنوي (تقريبي)</th></tr></thead><tbody>`;
  scenarios.forEach(s=>{
    scHtml += `<tr><td>${Math.round(s.p*100)}%</td><td>${formatSAR(Math.round(s.rev))}</td><td>${formatSAR(Math.round(s.net))}</td><td>${formatSAR(Math.round(s.partners))}</td><td>${formatSAR(Math.round(s.invGain))}</td></tr>`;
  });
  scHtml += `</tbody></table></div>`;
  document.getElementById('scenarios_box').innerHTML = scHtml;

  // Return some values if needed
  return {annualRevenue,operatingExpenses,netProfit,investorAnnualGain,years};
}

// Investor submit + Whatsapp
function submitInvestor(){
  const name = document.getElementById('inv_name').value || '—';
  const phone = document.getElementById('inv_phone').value || '—';
  const invType = document.querySelector('input[name="inv_type"]:checked')?.value || 'amount';
  let invested = 0;
  if(invType === 'amount'){ invested = Number(document.getElementById('inv_amount').value)||0; }
  else { invested = (CAPITAL / Number(document.getElementById('inv_total_shares').value||1500)) * (Number(document.getElementById('inv_shares').value)||0); }
  const exitChoice = document.getElementById('inv_exit_choice').value || '—';
  const lockMonths = Number(document.getElementById('inv_lock_months').value)||15;
  const msg = `طلب استثمار\nالاسم: ${name}\nالجوال: ${phone}\nنوع الاستثمار: ${invType}\nالمبلغ/قيمة الأسهم: ${formatSAR(Math.round(invested))}\nخيار الخروج: ${exitChoice}\nقفل استثماري (شهور): ${lockMonths}\nالرجاء التواصل لاتمام الإجراءات والتوقيع لدى محامٍ معتمد.`;
  sendWhatsAppMessage(msg);
}

// ====== Utility: load default values on pages ======
function pageInit(){
  // booking defaults
  if(document.getElementById('book_daily')){
    document.getElementById('book_driver_fee').value = 80;
    document.getElementById('book_gps_fee').value = 25;
    document.getElementById('book_delivery_fee').value = 0;
    calcBookingTotal();
  }
  if(document.getElementById('extend_daily')) calcExtend();

  // investor defaults
  if(document.getElementById('inv_amount')) {
    document.getElementById('inv_total_shares').value = 1500;
    document.getElementById('inv_avg_car_price').value = 70000;
    document.getElementById('inv_fleet_count').value = 15;
    document.getElementById('inv_avg_daily').value = 200;
    document.getElementById('inv_avg_days').value = 20;
    document.getElementById('inv_expense_rate').value = 0.70;
    document.getElementById('inv_occupancy').value = 0.30;
    document.getElementById('inv_lock_months').value = 15;
    document.getElementById('inv_growth_rate').value = 0.10;
  }
}
window.addEventListener('DOMContentLoaded', pageInit);
