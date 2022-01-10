package com.aial.platform.controller.aial;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.aial.platform.aial.Knn;
import com.aial.platform.bean.Result;
import com.aial.platform.config.SiteConfig;
import com.aial.platform.entity.admin.User;
import com.aial.platform.interceptor.admin.AuthorityInterceptor;
import com.aial.platform.service.admin.OperaterLogService;
import com.aial.platform.util.SessionUtil;
/**
 * 学生学习页面管理
 *
 */
@Controller
@RequestMapping(value="/aial")
public class AIALController {
	
	@Autowired	
	private OperaterLogService operaterLogService;
	
	private Logger log = LoggerFactory.getLogger(AIALController.class);

	/**
	 * KNN理论页面
	 * @param model
	 * @return
	 */
	@RequestMapping(value="/kNN_learn")
	public String KNN_learn(Model model)
	{
		User loginuser = SessionUtil.getLoginedUser();
		operaterLogService.add("学生"+ loginuser.getSno()+"学习KNN理论模块");
		return "aial/learn/kNN";
	}

	/**
	 * KNN实验页面
	 * @param model
	 * @return
	 */
	@RequestMapping(value="/kNN_show")
	public String KNN_show(Model model)
	{
		User loginuser = SessionUtil.getLoginedUser();
		operaterLogService.add("学生"+ loginuser.getSno()+"学习KNN实验模块");
		return "aial/animated/kNN";
	}
		
}
