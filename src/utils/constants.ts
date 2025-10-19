export function convertToKwanzaMoney(value: number, withoutSymbol: boolean) {
	let money = ''
	if (value.valueOf() >= 1000) {

		money = value.toLocaleString("pt-PT", {
			style: "currency",
			currency: "AOA"
		})

		if (value.valueOf() > 9999) {
			const moneyFormated = money.replace(/\s/g, ".").replace("AOA", "Kz")
			return moneyFormated.replace(".Kz", " Kz")
		} else {

			const parts = money.split(",");
			const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
			const formattedMoney = integerPart + "," + parts[1]
			return withoutSymbol ? formattedMoney.replace("AOA", "") : formattedMoney.replace("AOA", "Kz")
		}

	}

	money = value.toLocaleString("pt-PT", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	const parts = money.split(",");
	const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	const formattedMoney = integerPart + "," + parts[1] + " Kz";
	return formattedMoney;
}