import {
    NUM,
    VAR,
    OPER
} from './types';
import OPERAND_ALL from './operands';
import LexParser from './lex';

export default class SyntaxChecker extends LexParser{
	static syntaxTable={
		'START':{
			'N':true,
			'S':true,
			'(':true
		},
		'N':{
			'B':true,
			')':true,
			'END':true
		},
		'S':{
			'N':true,
			'(':true
		},
		'B':{
			'N':true,
			'(':true,
			'S':true
		},
		'(':{
			'S':true,
			'N':true,
			'(':true
		},
		')':{
			')':true,
			'B':true,
			'END':true
		},
	};

	static lastTokenNEGConv={
		'START':true,
		'(':true,
		'B':true,
		'S':true
	}
	static getTokenType(token){
		if(!token){
			return 'START';
		}
		if (token.type == NUM || token.type == VAR) {
			return 'N';
		} else if (token.type == OPER) {
			if (token.value == '(') {
				return '(';
			} else if (token.value == ')') {
				return ')';
			} else if (OPERAND_ALL[token.value].binocular) {
				return 'B';
			} else {
				return 'S';
			}
		}
		return null;
	}
	constructor(input){
		super(input);
        this.__reset();
	}
    [Symbol.iterator](){
        return this;
    }
    __reset(){
        this.__lastToken=null;
        this.__lastTokenType='START';
        this.__bracketDepth=0;
    }
	next(){
        const syntaxTable=SyntaxChecker.syntaxTable;
        try{

            let {done,value}=super.next();
            let pos=super.getPos(),
                token=null,
                tokenType=null;
            

            if(done){
                tokenType='END';
            }else{
                pos-=value.value.length;
                token={...value};

                if(OPER==token.type && '-'==token.value && SyntaxChecker.lastTokenNEGConv[this.__lastTokenType]){

                    let lastToken=this.__lastToken;
                    if(lastToken && OPER==lastToken.type && ('NEG'==lastToken.value || '-'==lastToken.value)){
                        throw new SyntaxError(`Invalid input at position ${pos}`);
                    }
                    token.value='NEG';
                }
                tokenType=SyntaxChecker.getTokenType(token);
            }


            if(!syntaxTable[this.__lastTokenType] || !syntaxTable[this.__lastTokenType][tokenType]){
                throw new SyntaxError(`Invalid input at position ${pos}`);
            }


            switch(tokenType){
                case '(':
                    this.__bracketDepth++;
                break;
                case ')':
                    this.__bracketDepth--;
                break;
                case 'END':
                    if(this.__bracketDepth){
                        throw new SyntaxError(`Bracket mismatch`);
                    }
                break;
            }

            if('END'==tokenType){
                this.__reset();
                return{
                    done:true
                };
            }

            this.__lastToken=token;
            this.__lastTokenType=tokenType;

            return{
                done:false,
                value:token
            }
        }catch(e){
            try{
                this.__reset();
            }catch(e){
                console.error(e);
            }
            throw(e);
        }
	}
}
