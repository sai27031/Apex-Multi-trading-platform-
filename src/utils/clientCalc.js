export const updateClientTrade = (client, { symbol, companyName, exchange, sector, side, quantity, price }) => {
  const qty = Number(quantity);
  const pr = Number(price);
  if (!qty || qty <= 0 || !client) return client;

  if (!client.holdings) client.holdings = [];
  let hIdx = client.holdings.findIndex(h => h.symbol === symbol);

  if (side === 'BUY') {
    const cost = qty * pr;
    // Deduct cash margin
    client.cashMargin = Math.max(0, (client.cashMargin || 0) - cost);
    client.utilizedMargin = (client.utilizedMargin || 0) + Math.round(cost * 0.2);

    if (hIdx >= 0) {
      const prevH = client.holdings[hIdx];
      const totalQty = prevH.quantity + qty;
      const totalInvested = (prevH.quantity * prevH.avgBuyPrice) + cost;
      prevH.avgBuyPrice = Number((totalInvested / totalQty).toFixed(2));
      prevH.quantity = totalQty;
      prevH.currentPrice = pr;
      prevH.investedValue = totalInvested;
      prevH.currentValue = totalQty * pr;
      prevH.unrealizedPnl = prevH.currentValue - prevH.investedValue;
      prevH.unrealizedPnlPercent = prevH.investedValue > 0 ? Number(((prevH.unrealizedPnl / prevH.investedValue) * 100).toFixed(2)) : 0;
    } else {
      client.holdings.push({
        symbol,
        companyName: companyName || symbol,
        exchange: exchange || 'NSE',
        sector: sector || 'Equities',
        quantity: qty,
        avgBuyPrice: pr,
        currentPrice: pr,
        investedValue: cost,
        currentValue: cost,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        dayChange: 0,
        dayChangePercent: 0
      });
    }
  } else if (side === 'SELL') {
    if (hIdx >= 0) {
      const prevH = client.holdings[hIdx];
      const actualSellQty = Math.min(qty, prevH.quantity);
      const sellProceeds = actualSellQty * pr;
      
      // Credit cash margin back to client
      client.cashMargin = (client.cashMargin || 0) + sellProceeds;
      client.utilizedMargin = Math.max(0, (client.utilizedMargin || 0) - Math.round(sellProceeds * 0.2));

      if (actualSellQty >= prevH.quantity) {
        // All shares sold
        client.holdings.splice(hIdx, 1);
      } else {
        prevH.quantity -= actualSellQty;
        prevH.investedValue = prevH.quantity * prevH.avgBuyPrice;
        prevH.currentValue = prevH.quantity * pr;
        prevH.unrealizedPnl = prevH.currentValue - prevH.investedValue;
        prevH.unrealizedPnlPercent = prevH.investedValue > 0 ? Number(((prevH.unrealizedPnl / prevH.investedValue) * 100).toFixed(2)) : 0;
      }
    }
  }

  // Recalculate client totals
  let totalInv = 0;
  let curVal = 0;
  let dayPnl = 0;

  client.holdings.forEach(h => {
    totalInv += (h.investedValue || 0);
    curVal += (h.currentValue || 0);
    dayPnl += ((h.dayChange || 0) * h.quantity);
  });

  client.totalInvested = Math.round(totalInv);
  client.currentValue = Math.round(curVal);
  client.totalPnl = Math.round(curVal - totalInv);
  client.totalPnlPercent = totalInv > 0 ? Number(((client.totalPnl / totalInv) * 100).toFixed(2)) : 0;
  client.dailyPnl = Math.round(dayPnl);
  client.dailyPnlPercent = curVal > 0 ? Number(((dayPnl / curVal) * 100).toFixed(2)) : 0;

  return client;
};
