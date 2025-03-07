const {article,proper} = require("../modules/lang");

module.exports = {
	help: cfg => "View or change " + article(cfg) + " " + cfg.lang + "'s brackets",
	usage: cfg =>  [
		{usage: "brackets", params: "<name> [brackets]", description: `If brackets are given, change the ${cfg.lang}'s brackets. If not, simply echo the current ones.`},
		{usage: "brackets", params: "add <name> <brackets>", description: "Add another set of brackets to proxy with."},
		{usage: "brackets", params: "remove <name> <brackets>", description: "Remove a set of brackets, unless it's the only one."}],
	desc: cfg => "Brackets must be the word 'text' surrounded by any symbols or letters, i.e. `[text]` or `>>text`",
	permitted: () => true,
	groupArgs: true,
	execute: async (bot, msg, args, cfg) => {
		if(!args[0]) return bot.cmds.help.execute(bot, msg, ["brackets"], cfg);

		//check arguments
		let name = (args[0] == "add" || args[0] == "remove") ? args[1] : args[0];
		let member = await bot.db.getMember(msg.author.id,name);
		if(!member) return "You don't have " + article(cfg) + " " + cfg.lang + " with that name registered.";
		if(!args[1]) return `Brackets for ${args[0]}: ${bot.getBrackets(member)}`;
		let brackets = msg.content.slice(msg.content.indexOf(name)+name.length+1).trim().split("text");
		if(brackets.length < 2) return "No 'text' found to detect brackets with. For the last part of your command, enter the word 'text' surrounded by any characters.\nThis determines how the bot detects if it should replace a message.";
		if(!brackets[0] && !brackets[1]) return "Need something surrounding 'text'.";
		if(args[0] == "add") {
			member.brackets = member.brackets.concat(brackets);
			await bot.db.updateMember(msg.author.id,member.name,"brackets",member.brackets);
			return "Brackets added.";
		} else if(args[0] == "remove") {
			let index = -1;
			for(let i=0; i<member.brackets.length; i+=2) {
				if(member.brackets[i] == brackets[0] && member.brackets[i+1] == brackets[1]) {
					index = i;
					break;
				}
			}
			if(index < 0) return "No matching brackets found.";
			if(member.brackets.length < 3) return "Cannot remove last brackets.";
			member.brackets = member.brackets.slice(0,index).concat(member.brackets.slice(index+2));
			await bot.db.updateMember(msg.author.id,member.name,"brackets",member.brackets);
			return "Brackets removed.";
		}

		//update member
		await bot.db.updateMember(msg.author.id,member.name,"brackets",brackets);
		return "Brackets set successfully.";
	}
};
