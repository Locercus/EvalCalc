// I'm not using .toTex() function, as it oftentimes generates invalid LaTeX.

// s=(3 * 4)/(5 + sqrt(2)/sin(30deg))
function generateTeX(m) {
	m.forEach(function(node, path, parent) {
		switch(node.type) {
			case 'OperatorNode': {
				switch(node.op) {

				}
				break;
			}
			default: {
				throw node.type + " has not been implemented";
			}
		}
	});

	return "\\sin\\left(\\frac{on \\cdot the}{way}\\right)";
}